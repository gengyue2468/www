import { join, dirname, extname, basename } from "path";
import { readdir, writeFile, stat } from "fs/promises";
import { ensureDir } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate, renderNav } from "../utils/template.js";
import { formatDate } from "../utils/date.js";
import { hasFileChanged } from "../utils/cache.js";
import config from "../config.js";
import type { Post } from "../types.js";
import type { BuildCacheManager } from "../utils/cache.js";

function generateTagsHTML(allTags: string[]): string {
  const tagCounts: Record<string, number> = {};
  allTags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  const sortedTags = [...new Set(allTags)].sort(
    (a, b) => tagCounts[b] - tagCounts[a]
  );

  let tagsHtml = '<div class="tags-list">';
  for (const tag of sortedTags) {
    tagsHtml += `<span class="tag">#${tag}</span>`;
  }
  tagsHtml += "</div>";
  return tagsHtml;
}

function generatePostTagsHTML(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "";
  let tagsHtml = '<div class="post-tags" style="margin-top: 2rem; margin-bottom: 1rem;">';
  for (const tag of tags) {
    tagsHtml += `<span class="tag">#${tag}</span>`;
  }
  tagsHtml += "</div>";
  return tagsHtml;
}

export async function buildBlogIndex(
  baseLayout: string,
  blogIndexLayout: string,
  cacheManager?: BuildCacheManager,
  force?: boolean,
  year?: number,
  css?: string,
  postsChanged?: boolean
): Promise<{ posts: Post[]; indexChanged: boolean; postsChanged: boolean }> {
  const blogDir = config.dirs.blog;
  const posts: Post[] = [];

  // Check if blog directory exists
  let blogDirExists = true;
  try {
    await stat(blogDir);
  } catch {
    blogDirExists = false;
  }

  if (blogDirExists) {
    const files = await readdir(blogDir);
    for (const file of files) {
      if (extname(file) === ".md") {
        const filePath = join(blogDir, file);
        const { frontmatter } = await renderMarkdown(filePath);
        const slug = basename(file, ".md");

        // Check if this post has changed
        const postChanged = cacheManager
          ? await hasFileChanged(filePath, cacheManager.getBlogPostMtime(slug))
          : true;
        if (postChanged) {
          postsChanged = true;
        }

        posts.push({
          slug,
          title: frontmatter.title || slug,
          date: frontmatter.date || "",
          excerpt: frontmatter.excerpt || "",
          summary: frontmatter.summary || "",
          tags: frontmatter.tags || [],
        });
      }
    }

    posts.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  const allTags: string[] = [];
  posts.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      allTags.push(...post.tags);
    }
  });

  const tagsHtml = generateTagsHTML(allTags);
  let postsListHtml = posts.length > 0 ? generatePostsListHTML(posts) : "<p>No posts yet.</p>";
  const tagsSection = `<div style="margin-top: 3rem;">${tagsHtml}</div>`;
  postsListHtml += tagsSection;

  const contentData = { title: "Blog", postsList: postsListHtml };
  const renderedContent = renderTemplate(blogIndexLayout, contentData);

  const baseData = {
    title: "Blog",
    siteTitle: config.site.title,
    description: config.site.description,
    author: config.site.author,
    year: year?.toString() || new Date().getFullYear().toString(),
    content: renderedContent,
    css: css || "",
    nav: renderNav(config.nav),
  };
  const output = renderTemplate(baseLayout, baseData);

  const outputPath = join(config.dirs.dist, "blog", "index.html");
  await ensureDir(dirname(outputPath));

  // Check if we should rebuild
  const shouldRebuild = force === true || postsChanged === true;
  let indexChanged = shouldRebuild;
  postsChanged = shouldRebuild; // Track if any posts changed for return value

  if (!shouldRebuild && cacheManager) {
    const outputStat = await stat(outputPath).catch(() => null);
    indexChanged = !outputStat;
  }

  if (indexChanged || shouldRebuild) {
    await writeFile(outputPath, output, "utf-8");
    console.log(`✓ Built /blog -> ${outputPath}`);
  } else {
    console.log(`⏭ Skipped /blog (unchanged)`);
  }

  return { posts, indexChanged, postsChanged };
}

function generatePostsListHTML(posts: Post[]): string {
  let postsHtml = '<ul class="posts-list">';
  for (const post of posts) {
    postsHtml += `<li class="post-item">`;
    postsHtml += `<a href="/blog/${post.slug}">${post.title}</a>`;
    if (post.date) {
      const formattedDate = formatDate(post.date);
      postsHtml += ` <span style="${config.styles.dateInline}">${formattedDate}</span>`;
    }
    postsHtml += "</li>";
  }
  postsHtml += "</ul>";
  return postsHtml;
}

export async function buildBlogPosts(
  posts: Post[],
  baseLayout: string,
  blogPostLayout: string,
  cacheManager?: BuildCacheManager,
  force?: boolean,
  year?: number,
  css?: string
): Promise<void> {
  const blogDir = config.dirs.blog;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const filePath = join(blogDir, `${post.slug}.md`);
    const { frontmatter, html } = await renderMarkdown(filePath);
    const title = frontmatter.title || post.slug;

    const formattedDate = formatDate(frontmatter.date);
    const dateDisplay = formattedDate ? "block" : "none";

    let prevPost: Post | null = null;
    let nextPost: Post | null = null;

    if (i > 0) prevPost = posts[i - 1];
    if (i < posts.length - 1) nextPost = posts[i + 1];

    let navHtml = "";
    if (prevPost || nextPost) {
      navHtml = `<nav style="${config.styles.nav}">`;
      if (prevPost) {
        navHtml += `<a href="/blog/${prevPost.slug}" style="${config.styles.navLink}">← ${prevPost.title}</a>`;
      }
      if (nextPost) {
        navHtml += `<a href="/blog/${nextPost.slug}" style="${config.styles.navLink}">${nextPost.title} →</a>`;
      }
      navHtml += "</nav>";
    }

    const postTagsHtml = generatePostTagsHTML(frontmatter.tags);
    const dateClass = dateDisplay === "none" ? " hidden" : "";
    const contentData = {
      title,
      date: formattedDate,
      dateClass,
      content: html,
      tags: postTagsHtml,
      navigation: navHtml,
    };
    const renderedContent = renderTemplate(blogPostLayout, contentData);

    const description = frontmatter.summary || config.site.description;
    const baseData = {
      title,
      siteTitle: config.site.title,
      description,
      author: config.site.author,
      year: year?.toString() || new Date().getFullYear().toString(),
      content: renderedContent,
      css: css || "",
      nav: renderNav(config.nav),
    };
    const output = renderTemplate(baseLayout, baseData);

    const outputPath = join(config.dirs.dist, "blog", post.slug, "index.html");
    await ensureDir(dirname(outputPath));

    // Check if we should rebuild
    const fileMtime = (await stat(filePath)).mtimeMs;
    const shouldRebuild = force === true ||
      (cacheManager && hasFileChanged(filePath, cacheManager.getBlogPostMtime(post.slug)));

    if (shouldRebuild || force) {
      await writeFile(outputPath, output, "utf-8");
      console.log(`✓ Built /blog/${post.slug} -> ${outputPath}`);
      cacheManager?.setBlogPostMtime(post.slug, fileMtime);
    } else {
      console.log(`⏭ Skipped /blog/${post.slug} (unchanged)`);
    }
  }
}


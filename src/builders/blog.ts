import { join, dirname, extname, basename } from "path";
import { readdir, writeFile, stat } from "fs/promises";
import { ensureDir } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate, renderNav } from "../utils/template.js";
import { formatDate } from "../utils/date.js";
import { hasMermaidCode as checkMermaidCode, mermaidScript } from "../extensions/mermaid.js";
import config from "../config.js";
import type { Post } from "../types.js";

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

function generatePostsListHTML(posts: Post[]): string {
  // Group posts by year
  const postsByYear: Record<string, Post[]> = {};
  for (const post of posts) {
    if (post.date) {
      const year = new Date(post.date).getFullYear().toString();
      if (!postsByYear[year]) {
        postsByYear[year] = [];
      }
      postsByYear[year].push(post);
    } else {
      if (!postsByYear[""]) {
        postsByYear[""] = [];
      }
      postsByYear[""].push(post);
    }
  }

  // Get sorted years (descending)
  const years = Object.keys(postsByYear).sort((a, b) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return parseInt(b) - parseInt(a);
  });

  let postsHtml = '';
  for (const year of years) {
    const yearPosts = postsByYear[year];
    if (year) {
      postsHtml += `<h3>${year}</h3>`;
    }
    postsHtml += '<ul class="posts-list">';
    for (const post of yearPosts) {
      postsHtml += `<li class="post-item">`;
      postsHtml += `<a href="/blog/${post.slug}">${post.title}</a>`;
      if (post.date) {
        const formattedDate = formatDate(post.date);
        postsHtml += ` <span style="${config.styles.dateInline}">${formattedDate}</span>`;
      }
      postsHtml += "</li>";
    }
    postsHtml += "</ul>";
  }
  return postsHtml;
}

export async function buildBlogIndex(
  baseLayout: string,
  blogIndexLayout: string,
  year?: number,
  css?: string
): Promise<Post[]> {
  const blogDir = config.dirs.blog;
  const posts: Post[] = [];

  try {
    const files = await readdir(blogDir);
    for (const file of files) {
      if (extname(file) === ".md") {
        const filePath = join(blogDir, file);
        const { frontmatter } = await renderMarkdown(filePath);
        const slug = basename(file, ".md");

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
  } catch {
    // Blog directory doesn't exist
  }

  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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
    scripts: "",
  };
  const output = renderTemplate(baseLayout, baseData);

  const outputPath = join(config.dirs.dist, "blog", "index.html");
  await ensureDir(dirname(outputPath));
  await writeFile(outputPath, output, "utf-8");
  console.log(`✓ Built /blog -> ${outputPath}`);

  return posts;
}

export async function buildBlogPosts(
  posts: Post[],
  baseLayout: string,
  blogPostLayout: string,
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
    const dateClass = formattedDate ? "" : " hidden";
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
    const hasMermaid = html.includes('class="mermaid"') || checkMermaidCode(html);
    const scripts = hasMermaid ? mermaidScript : "";

    const baseData = {
      title,
      siteTitle: config.site.title,
      description,
      author: config.site.author,
      year: year?.toString() || new Date().getFullYear().toString(),
      content: renderedContent,
      css: css || "",
      nav: renderNav(config.nav),
      scripts,
    };
    const output = renderTemplate(baseLayout, baseData);

    const outputPath = join(config.dirs.dist, "blog", post.slug, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFile(outputPath, output, "utf-8");
    console.log(`✓ Built /blog/${post.slug}`);
  }
}

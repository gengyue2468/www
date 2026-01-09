import { join, dirname, extname, basename } from "path";
import { readdir, writeFile } from "fs/promises";
import { ensureDir, loadLayout } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import { formatDate } from "../utils/date.js";
import config from "../config.js";
import type { Post } from "../types.js";

/**
 * Generate tags HTML (plain text, no filtering)
 */
function generateTagsHTML(allTags: string[], posts: Post[]): {
  tagsHtml: string;
  postsHtml: string;
} {
  // Sort tags by frequency
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

  // Generate posts list (no tag filtering)
  let postsHtml = "";
  if (posts.length > 0) {
    postsHtml = '<ul class="posts-list">';
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
  }

  return { tagsHtml, postsHtml };
}

/**
 * Generate tags HTML for post page (plain text)
 */
function generatePostTagsHTML(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "";
  let tagsHtml =
    '<div class="post-tags" style="margin-top: 2rem; margin-bottom: 1rem;">';
  for (const tag of tags) {
    tagsHtml += `<span class="tag">#${tag}</span>`;
  }
  tagsHtml += "</div>";
  return tagsHtml;
}

/**
 * Build blog index page
 */
export async function buildBlogIndex(
  baseLayout: string,
  blogIndexLayout: string
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

    // Sort by date (newest first)
    posts.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") throw err;
  }

  // Collect all tags (already merged)
  const allTags: string[] = [];
  posts.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      allTags.push(...post.tags);
    }
  });

  // Generate tags and posts HTML
  const { tagsHtml, postsHtml } = generateTagsHTML(allTags, posts);

  // Generate blog list HTML with tags
  let postsListHtml = postsHtml || "<p>No posts yet.</p>";
  const tagsSection = `<div style="margin-top: 3rem;">${tagsHtml}</div>`;
  postsListHtml += tagsSection;

  // First render the content layout
  const contentData = {
    title: "Blog",
    postsList: postsListHtml,
  };
  const renderedContent = renderTemplate(blogIndexLayout, contentData);

  // Then render the base layout with the content
  const baseData = {
    title: "Blog",
    siteTitle: config.site.title,
    description: config.site.description,
    author: config.site.author,
    content: renderedContent,
  };
  const output = renderTemplate(baseLayout, baseData);

  const outputPath = join(config.dirs.dist, "blog", "index.html");
  await ensureDir(dirname(outputPath));
  await writeFile(outputPath, output, "utf-8");
  console.log(`✓ Built /blog -> ${outputPath}`);

  return posts;
}

/**
 * Build all blog posts
 */
export async function buildBlogPosts(
  posts: Post[],
  baseLayout: string,
  blogPostLayout: string
): Promise<void> {
  const blogDir = config.dirs.blog;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const filePath = join(blogDir, `${post.slug}.md`);
    const { frontmatter, html } = await renderMarkdown(filePath);
    const title = frontmatter.title || post.slug;

    // Format date
    const formattedDate = formatDate(frontmatter.date);
    const dateDisplay = formattedDate ? "block" : "none";

    // Find previous and next posts
    let prevPost: Post | null = null;
    let nextPost: Post | null = null;

    if (i > 0) {
      prevPost = posts[i - 1];
    }
    if (i < posts.length - 1) {
      nextPost = posts[i + 1];
    }

    // Generate navigation HTML
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

    // Generate tags HTML for post
    const postTagsHtml = generatePostTagsHTML(frontmatter.tags);

    // First render the content layout
    const dateClass = dateDisplay === "none" ? " hidden" : "";
    const contentData = {
      title,
      date: formattedDate,
      dateClass: dateClass,
      content: html,
      tags: postTagsHtml,
      navigation: navHtml,
    };
    const renderedContent = renderTemplate(blogPostLayout, contentData);

    // Then render the base layout with the content
    // Use frontmatter summary as description, fallback to site description
    const description = frontmatter.summary || config.site.description;
    const baseData = {
      title,
      siteTitle: config.site.title,
      description: description,
      author: config.site.author,
      content: renderedContent,
    };
    const output = renderTemplate(baseLayout, baseData);

    const outputPath = join(config.dirs.dist, "blog", post.slug, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFile(outputPath, output, "utf-8");
    console.log(`✓ Built /blog/${post.slug} -> ${outputPath}`);
  }
}


import { join } from "path";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import config from "../config.js";
import type { Post } from "../types.js";

const siteUrl = () => config.site.url.replace(/\/$/, "");

/**
 * Emit markdown files for LLMs using optimized file operations
 * Processes files in parallel for better performance
 */
export async function emitMarkdownFiles(posts: Post[]): Promise<void> {
  const { dist, blog: blogDir, pages: pagesDir } = config.dirs;

  // Process blog posts in parallel
  const blogPromises = posts.map(async (post) => {
    const srcPath = join(blogDir, `${post.slug}.md`);
    const outPath = join(dist, "blog", `${post.slug}.md`);
    try {
      const file = Bun.file(srcPath);
      const raw = await file.text();
      await ensureDir(join(dist, "blog"));
      await writeFileContent(outPath, raw);
    } catch (err) {
      console.warn(`⚠ llms: skip blog md ${post.slug}:`, (err as NodeJS.ErrnoException).message);
    }
  });

  // Page routes
  const pageRoutes = [
    { file: "index.md", mdPath: "index.html.md" },
    { file: "about.md", mdPath: "about.md" },
    { file: "now.md", mdPath: "now.md" },
  ];

  // Process pages in parallel
  const pagePromises = pageRoutes.map(async ({ file, mdPath }) => {
    const srcPath = join(pagesDir, file);
    const outPath = join(dist, mdPath);
    try {
      const file = Bun.file(srcPath);
      const raw = await file.text();
      await writeFileContent(outPath, raw);
    } catch (err) {
      console.warn(`⚠ llms: skip page md ${file}:`, (err as NodeJS.ErrnoException).message);
    }
  });

  // Wait for all file operations to complete
  await Promise.all([...blogPromises, ...pagePromises]);

  const total = posts.length + pageRoutes.length;
  console.log(`✓ Emitted ${total} markdown file(s) for LLMs`);
}

/**
 * Generate llms.txt using array join for efficient string building
 */
export async function generateLlmsTxt(posts: Post[]): Promise<void> {
  if (!config.llms.enabled) return;

  const base = siteUrl();
  const title = config.site.title;
  const summary = config.llms.summary ?? config.site.description;

  const parts: string[] = [
    `# ${title}`,
    "",
    `> ${summary}`,
    "",
    "## 页面",
    "",
    `- [Home](${base}/index.html.md): Home 页`,
    `- [About](${base}/about.md): About 页`,
    `- [Now](${base}/now.md): Now 页`,
    "",
    "## 博客",
    "",
  ];

  // Add blog posts
  for (const post of posts) {
    const url = `${base}/blog/${post.slug}.md`;
    const desc = post.summary
      ? post.summary.slice(0, 196) + (post.summary.length > 196 ? "…" : "")
      : "博客文章原文";
    parts.push(`- [${post.title}](${url}): ${desc}`);
  }

  const llmsPath = join(config.dirs.dist, "llms.txt");
  await writeFileContent(llmsPath, parts.join("\n"));
  console.log(`✓ Generated llms.txt -> ${llmsPath}`);
}

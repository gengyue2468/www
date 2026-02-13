import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { ensureDir } from "../utils/fs.js";
import config from "../config.js";
import type { Post } from "../types.js";

const siteUrl = () => config.site.url.replace(/\/$/, "");

/**
 * 将博客与页面的原文 Markdown 输出到 dist，便于 LLM 直接读取。
 * - 博客：/blog/{slug}.md
 * - 页面：/about.md, /now.md, /index.html.md（首页）
 */
export async function emitMarkdownFiles(posts: Post[]): Promise<void> {
  const { dist, blog: blogDir, pages: pagesDir } = config.dirs;

  for (const post of posts) {
    const srcPath = join(blogDir, `${post.slug}.md`);
    const outPath = join(dist, "blog", `${post.slug}.md`);
    try {
      const raw = await readFile(srcPath, "utf-8");
      await ensureDir(join(dist, "blog"));
      await writeFile(outPath, raw, "utf-8");
    } catch (err) {
      console.warn(`⚠ llms: skip blog md ${post.slug}:`, (err as NodeJS.ErrnoException).message);
    }
  }

  const pageRoutes: { file: string; mdPath: string }[] = [
    { file: "index.md", mdPath: "index.html.md" },
    { file: "about.md", mdPath: "about.md" },
    { file: "now.md", mdPath: "now.md" },
  ];

  for (const { file, mdPath } of pageRoutes) {
    const srcPath = join(pagesDir, file);
    const outPath = join(dist, mdPath);
    try {
      const raw = await readFile(srcPath, "utf-8");
      await writeFile(outPath, raw, "utf-8");
    } catch (err) {
      console.warn(`⚠ llms: skip page md ${file}:`, (err as NodeJS.ErrnoException).message);
    }
  }

  const total = posts.length + pageRoutes.length;
  console.log(`✓ Emitted ${total} markdown file(s) for LLMs`);
}

/**
 * 生成 /llms.txt（符合 llmstxt.org 规范），供 LLM 爬虫发现并理解站点。
 */
export async function generateLlmsTxt(posts: Post[]): Promise<void> {
  if (!config.llms.enabled) return;

  const base = siteUrl();
  const title = config.site.title;
  const summary = config.llms.summary ?? config.site.description;

  const lines: string[] = [
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

  for (const post of posts) {
    const url = `${base}/blog/${post.slug}.md`;
    const desc = post.summary ? post.summary.slice(0, 196) + (post.summary.length > 196 ? "…" : "") : "博客文章原文";
    lines.push(`- [${post.title}](${url}): ${desc}`);
  }

  const llmsPath = join(config.dirs.dist, "llms.txt");
  await writeFile(llmsPath, lines.join("\n"), "utf-8");
  console.log(`✓ Generated llms.txt -> ${llmsPath}`);
}

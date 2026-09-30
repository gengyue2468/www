import { join } from "path";
import { ensureDir, readFileContent, writeFileContent } from "../utils/fs.js";
import { cleanBaseUrl, joinUrlPath } from "../utils/url.js";
import config from "../config.js";
import type { CollectionOutput } from "../types.js";
import MarkdownIt from "markdown-it";
import { htmlToPlainText } from "../utils/seo.js";
import { collectionTagIndex, readPageMetadata } from "../utils/discovery.js";
import { parseCalendarDate } from "../utils/date.js";
import { sortPostsByDate } from "../utils/tags.js";

const markdown = new MarkdownIt();

function plainText(value: string): string {
  return markdown.utils.unescapeAll(htmlToPlainText(value))
    .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ").trim();
}

function escapeMarkdown(value: string): string {
  return value.replace(/[\\`*_{}\[\]()<>!#]/g, "\\$&");
}

function shortDescription(value: string, limit = 160): string {
  const chars = Array.from(plainText(value));
  return escapeMarkdown(chars.length > limit ? `${chars.slice(0, limit - 1).join("").trimEnd()}…` : chars.join(""));
}

function link(label: string, url: string, description: string): string {
  const href = url.replace(/\(/g, "%28").replace(/\)/g, "%29");
  return `- [${escapeMarkdown(label.replace(/\s+/g, " ").trim())}](${href}): ${description}`;
}

function collectionLabel(collection: CollectionOutput): string {
  return collection.name.charAt(0).toUpperCase() + collection.name.slice(1);
}

function introduction(html: string): string {
  // Prefer the author's prose over an attribution quote, image caption, note,
  // or a large code/benchmark block. Skip image-only and empty paragraphs.
  const prose = html.replace(/<(blockquote|pre|figure|aside|footer|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  for (const paragraph of prose.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    if (plainText(paragraph[1])) return paragraph[1];
  }
  return prose;
}

export async function emitMarkdownFiles(collections: CollectionOutput[]): Promise<void> {
  const { dist, pages: pagesDir } = config.dirs;

  const collPromises = collections.map(async (collection) => {
    const outDir = join(dist, collection.urlPrefix);
    await ensureDir(outDir);

    await Promise.all(
      collection.items.map(async (post) => {
        const srcPath = join(collection.srcDir, `${post.slug}.md`);
        const outPath = join(outDir, `${post.slug}.md`);
        const raw = await readFileContent(srcPath);
        await writeFileContent(outPath, raw);
      })
    );
  });

  await Promise.all(
    Object.entries(config.routes).map(async ([route, file]) => {
      const mdPath = route === "/" ? "index.md" : `${route.slice(1)}.md`;
      const srcPath = join(pagesDir, file);
      const outPath = join(dist, mdPath);
      const raw = await readFileContent(srcPath);
      await writeFileContent(outPath, raw);
    })
  );

  await Promise.all(collPromises);
  const total = collections.reduce((sum, collection) => sum + collection.items.length, 0)
    + Object.keys(config.routes).length;
  console.log(`✓ Emitted ${total} markdown file(s) for LLMs`);
}

export async function buildLlmsTxt(collections: readonly CollectionOutput[]): Promise<string> {
  const base = cleanBaseUrl(config.site.url);
  const orderedCollections = [...collections].sort((a, b) => a.urlPrefix.localeCompare(b.urlPrefix, "en"));
  const collectionRoutes = new Set(collections.map(collection => joinUrlPath(collection.urlPrefix)));

  const parts: string[] = [
    `# ${escapeMarkdown(plainText(config.site.title))}`,
    "",
    `> ${shortDescription(config.llms.summary ?? config.site.description, 300)}`,
    "",
    "文章和静态页面优先链接 Markdown 原文；栏目与标签链接指向 HTML 归档。",
    "标签第一项为主分类，第二项为可选交叉主题；标签归档计数包含交叉标签。日期和记录反映写作时的情况，不保证配置、价格或服务状态仍然有效。",
    "",
    "## 页面",
    "",
  ];

  const pages = await Promise.all(Object.entries(config.routes)
    .filter(([route]) => !collectionRoutes.has(route) && route !== "/404")
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(async ([route, file]) => ({ route, ...await readPageMetadata(join(config.dirs.pages, file)) })));
  for (const { route, title, description } of pages) {
    const mdPath = route === "/" ? "index.md" : `${route.slice(1)}.md`;
    const label = title || (route === "/" ? "Home" : route.slice(1));
    parts.push(link(label, `${base}${joinUrlPath(...mdPath.split("/"))}`, shortDescription(description || `${label} 页面`)));
  }

  parts.push("", "## 内容索引", "");
  const taggedCollections = orderedCollections.map(collection => ({ collection, tags: collectionTagIndex(collection) }));
  for (const { collection, tags } of taggedCollections) {
    const label = collectionLabel(collection);
    parts.push(link(label, `${base}${joinUrlPath(collection.urlPrefix)}`, `${collection.items.length} 篇文章，按日期归档。`));
    if (tags.length) {
      parts.push(link(`${label} Tags`, `${base}${joinUrlPath(collection.urlPrefix, "tag")}`, `${tags.length} 个主题标签，${collection.items.length} 篇文章。`));
    }
  }

  if (taggedCollections.some(({ tags }) => tags.length)) {
    parts.push("", "## 标签", "");
    for (const { collection, tags } of taggedCollections) {
      for (const tag of [...tags].sort((a, b) => a.name.localeCompare(b.name, "en"))) {
        parts.push(link(`${collectionLabel(collection)} / ${tag.name}`, `${base}${joinUrlPath(collection.urlPrefix, "tag", tag.slug)}`,
          `${tag.count} 篇文章（${tag.primaryCount} 篇以此为主分类）。${shortDescription(tag.description)}`));
      }
    }
  }

  for (const collection of orderedCollections) {
    const label = escapeMarkdown(collectionLabel(collection));
    parts.push("", `## ${label}`, "");
    const rendered = new Map(collection.renderedItems.map(item => [item.slug, item.html]));
    for (const post of sortPostsByDate(collection.items)) {
      const url = `${base}${joinUrlPath(collection.urlPrefix, `${post.slug}.md`)}`;
      const html = rendered.get(post.slug) || "";
      const desc = [post.summary, post.excerpt, introduction(html)]
        .find(value => value && plainText(value)) || `${collectionLabel(collection)} 文章原文`;
      const metadata = [
        parseCalendarDate(post.date) ? `日期：${post.date}` : "",
        parseCalendarDate(post.updated) ? `更新：${post.updated}` : "",
        post.tags.length ? `主题：${post.tags.join(" / ")}` : "",
      ].filter(Boolean).join("；");
      parts.push(link(post.title, url, `${metadata ? `${metadata}。` : ""}${shortDescription(desc)}`));
    }
  }

  parts.push("", "## Optional", "",
    link("标签数据", `${base}/tags.json`, "跨栏目主题索引，含标签计数、文章路径、摘要和 primaryTag；version 为 1。"),
    ...(config.sitemap.enabled ? [link("Sitemap", `${base}/sitemap.xml`, "可索引 HTML 页面及其内容更新时间；不包含 Markdown 副本与 404。")] : []),
    ...(config.rss.enabled ? [link("RSS", `${base}/rss.xml`, "Blog 更新订阅，包含文章正文。")] : []),
  );
  return `${parts.join("\n")}\n`;
}

export async function generateLlmsTxt(collections: CollectionOutput[]): Promise<void> {
  if (!config.llms.enabled) return;

  const llmsPath = join(config.dirs.dist, "llms.txt");
  await writeFileContent(llmsPath, await buildLlmsTxt(collections));
  console.log(`✓ Generated llms.txt -> ${llmsPath}`);
}

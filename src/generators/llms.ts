import { join } from "path";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import config from "../config.js";
import type { CollectionOutput } from "../types.js";

const siteUrl = () => config.site.url.replace(/\/$/, "");

export async function emitMarkdownFiles(collections: CollectionOutput[]): Promise<void> {
  const { dist, pages: pagesDir } = config.dirs;

  const collPromises = collections.flatMap(collection =>
    collection.items.map(async (post) => {
      const srcPath = join(collection.srcDir, `${post.slug}.md`);
      const outPath = join(dist, collection.urlPrefix, `${post.slug}.md`);
      try {
        await ensureDir(join(dist, collection.urlPrefix));
        const file = Bun.file(srcPath);
        const raw = await file.text();
        await writeFileContent(outPath, raw);
      } catch (err) {
        console.warn(`⚠ llms: skip ${collection.urlPrefix}/${post.slug}.md:`, (err as NodeJS.ErrnoException).message);
      }
    })
  );

  const pageRoutes = [
    { file: "index.md", mdPath: "index.html.md" },
    { file: "about.md", mdPath: "about.md" },
  ];

  const pagePromises = pageRoutes.map(async ({ file, mdPath }) => {
    const srcPath = join(pagesDir, file);
    const outPath = join(dist, mdPath);
    try {
      const fileContent = Bun.file(srcPath);
      const raw = await fileContent.text();
      await writeFileContent(outPath, raw);
    } catch (err) {
      console.warn(`⚠ llms: skip page md ${file}:`, (err as NodeJS.ErrnoException).message);
    }
  });

  await Promise.all([...collPromises, ...pagePromises]);

  const total = collections.reduce((sum, c) => sum + c.items.length, 0) + pageRoutes.length;
  console.log(`✓ Emitted ${total} markdown file(s) for LLMs`);
}

export async function generateLlmsTxt(collections: CollectionOutput[]): Promise<void> {
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
  ];

  for (const collection of collections) {
    const label = collection.name.charAt(0).toUpperCase() + collection.name.slice(1);
    parts.push("", `## ${label}`, "");

    for (const post of collection.items) {
      const url = `${base}/${collection.urlPrefix}/${post.slug}.md`;
      const desc = post.summary
        ? post.summary.slice(0, 196) + (post.summary.length > 196 ? "…" : "")
        : `${label}文章原文`;
      parts.push(`- [${post.title}](${url}): ${desc}`);
    }
  }

  const llmsPath = join(config.dirs.dist, "llms.txt");
  await writeFileContent(llmsPath, parts.join("\n"));
  console.log(`✓ Generated llms.txt -> ${llmsPath}`);
}

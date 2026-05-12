import { join } from "path";
import { ensureDir, readFileContent, writeFileContent } from "../utils/fs.js";
import { cleanBaseUrl } from "../utils/url.js";
import config from "../config.js";
import type { CollectionOutput } from "../types.js";

export async function emitMarkdownFiles(collections: CollectionOutput[]): Promise<void> {
  const { dist, pages: pagesDir } = config.dirs;

  const collPromises = collections.map(async (collection) => {
    const outDir = join(dist, collection.urlPrefix);
    await ensureDir(outDir);

    const results = await Promise.allSettled(
      collection.items.map(async (post) => {
        const srcPath = join(collection.srcDir, `${post.slug}.md`);
        const outPath = join(outDir, `${post.slug}.md`);
        try {
          const raw = await readFileContent(srcPath);
          await writeFileContent(outPath, raw);
          return 1;
        } catch (err) {
          console.warn(`⚠ llms: skip ${collection.urlPrefix}/${post.slug}.md:`, (err as Error).message);
          return 0;
        }
      })
    );
    return results.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value : 0), 0);
  });

  const pageResults = await Promise.allSettled(
    Object.entries(config.routes).map(async ([route, file]) => {
      const mdPath = route === "/" ? "index.md" : `${route.slice(1)}.md`;
      const srcPath = join(pagesDir, file);
      const outPath = join(dist, mdPath);
      try {
        const raw = await readFileContent(srcPath);
        await writeFileContent(outPath, raw);
        return 1;
      } catch (err) {
        console.warn(`⚠ llms: skip page md ${file}:`, (err as Error).message);
        return 0;
      }
    })
  );

  const collCounts = await Promise.all(collPromises);
  const pageCount = pageResults.reduce((sum, r) => sum + (r.status === "fulfilled" ? r.value : 0), 0);
  const total = collCounts.reduce((a, b) => a + b, 0) + pageCount;
  console.log(`✓ Emitted ${total} markdown file(s) for LLMs`);
}

export async function generateLlmsTxt(collections: CollectionOutput[]): Promise<void> {
  if (!config.llms.enabled) return;

  const base = cleanBaseUrl(config.site.url);
  const title = config.site.title;
  const summary = config.llms.summary ?? config.site.description;

  const parts: string[] = [
    `# ${title}`,
    "",
    `> ${summary}`,
    "",
    "## 页面",
    "",
  ];

  for (const [route] of Object.entries(config.routes)) {
    const mdPath = route === "/" ? "index.md" : `${route.slice(1)}.md`;
    const label = route === "/" ? "Home" : route.slice(1).charAt(0).toUpperCase() + route.slice(2);
    parts.push(`- [${label}](${base}/${mdPath}): ${label} 页`);
  }

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

import { join, dirname } from "path";
import { writeFile } from "fs/promises";
import { ensureDir } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import config from "../config.js";

export async function buildPage(
  route: string,
  filePath: string,
  baseLayout: string,
  contentLayout: string,
  year?: number
): Promise<void> {
  const { frontmatter, html } = await renderMarkdown(filePath);
  const title = frontmatter.title || "Untitled";

  const contentData = { title, content: html };
  const renderedContent = renderTemplate(contentLayout, contentData);

  const baseData = {
    title,
    siteTitle: config.site.title,
    description: config.site.description,
    author: config.site.author,
    year: year?.toString() || new Date().getFullYear().toString(),
    content: renderedContent,
  };
  const output = renderTemplate(baseLayout, baseData);

  let outputPath: string;
  if (route === "/") {
    outputPath = join(config.dirs.dist, "index.html");
  } else {
    outputPath = join(config.dirs.dist, route.slice(1), "index.html");
    await ensureDir(dirname(outputPath));
  }

  await writeFile(outputPath, output, "utf-8");
  console.log(`✓ Built ${route} -> ${outputPath}`);
}


import { join, dirname } from "path";
import { writeFile } from "fs/promises";
import { ensureDir } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import config from "../config.js";

/**
 * Build a single page from a markdown file
 */
export async function buildPage(
  route: string,
  filePath: string,
  baseLayout: string,
  contentLayout: string
): Promise<void> {
  const { frontmatter, html } = await renderMarkdown(filePath);
  const title = frontmatter.title || "Untitled";

  // First render the content layout
  const contentData = {
    title,
    content: html,
  };
  const renderedContent = renderTemplate(contentLayout, contentData);

  // Then render the base layout with the content
  const baseData = {
    title,
    siteTitle: config.site.title,
    description: config.site.description,
    author: config.site.author,
    content: renderedContent,
  };
  const output = renderTemplate(baseLayout, baseData);

  // Determine output path
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


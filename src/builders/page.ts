import { join, dirname } from "path";
import { writeFile, readFile } from "fs/promises";
import { ensureDir } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import { minifyCss } from "../utils/compress.js";
import config from "../config.js";

// Cache for CSS content to avoid reading files multiple times
let cachedCss: string | null = null;

export async function getInlinedCss(): Promise<string> {
  if (cachedCss) return cachedCss;

  const { public: publicDir } = config.dirs;
  const tuftePath = join(publicDir, "tufte.css");
  const globalsPath = join(publicDir, "globals.css");

  try {
    const tufteCss = await readFile(tuftePath, "utf-8");
    const globalsCss = await readFile(globalsPath, "utf-8");
    // Merge and minify CSS
    const combined = `/* tufte.css */\n${tufteCss}\n\n/* globals.css */\n${globalsCss}`;
    cachedCss = `<style>\n${minifyCss(combined)}\n</style>`;
    return cachedCss;
  } catch (err) {
    console.warn("Warning: Could not read CSS files for inlining");
    return "";
  }
}

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

  // Get inlined CSS for critical rendering path
  const inlinedCss = await getInlinedCss();

  const baseData = {
    title,
    siteTitle: config.site.title,
    description: config.site.description,
    author: config.site.author,
    year: year?.toString() || new Date().getFullYear().toString(),
    content: renderedContent,
    css: inlinedCss,
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

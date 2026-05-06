import { join, dirname } from "path";
import { stat } from "fs/promises";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import { hasMermaidCode as checkMermaidCode, mermaidScript } from "../extensions/mermaid.js";
import { renderPage, applyHooks, applyAfterHooks } from "../utils/page-render.js";
import type { BuildHooks } from "../extensions/plugin.js";
import type { BuildCacheManager } from "../utils/cache.js";
import type { FrontMatter } from "../types.js";
import { buildMetaDescription, generateKeywords } from "../utils/seo.js";
import { errorReporter } from "../utils/errors.js";
import config from "../config.js";

interface CssCache {
  content: string;
  tufteMtime: number;
  globalsMtime: number;
}

let cssCache: CssCache | null = null;

function deduplicateFontFaces(css: string): string {
  const fontFaceRegex = /@font-face\s*\{[^}]+\}/g;
  const seen = new Set<string>();
  return css.replace(fontFaceRegex, (match) => {
    const key = match.replace(/\s+/g, " ").trim();
    if (seen.has(key)) return "";
    seen.add(key);
    return match;
  });
}

function lightweightCssMinify(css: string): string {
  return deduplicateFontFaces(css)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s+/gm, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .replace(/\s+/g, " ")
    .trim();
}

async function getFileMtime(filePath: string): Promise<number> {
  try {
    const { mtimeMs } = await stat(filePath);
    return mtimeMs;
  } catch {
    return 0;
  }
}

export async function getInlinedCss(): Promise<string> {
  const { public: publicDir } = config.dirs;
  const tuftePath = join(publicDir, "tufte.css");
  const globalsPath = join(publicDir, "globals.css");

  const [tufteMtime, globalsMtime] = await Promise.all([
    getFileMtime(tuftePath),
    getFileMtime(globalsPath),
  ]);

  if (cssCache && 
      cssCache.tufteMtime >= tufteMtime && 
      cssCache.globalsMtime >= globalsMtime) {
    return cssCache.content;
  }

  try {
    const [tufteFile, globalsFile] = await Promise.all([
      Bun.file(tuftePath),
      Bun.file(globalsPath),
    ]);

    const [tufteCss, globalsCss] = await Promise.all([
      tufteFile.text(),
      globalsFile.text(),
    ]);

    const combined = `${tufteCss}\n${globalsCss}`;
    const minified = lightweightCssMinify(combined);
    const content = `<style>\n${minified}\n</style>`;
    
    cssCache = { content, tufteMtime, globalsMtime };
    return content;
  } catch (err) {
    errorReporter.reportWarning("Could not read CSS files for inlining", {
      tuftePath,
      globalsPath,
    });
    return "";
  }
}

function buildPageOutput(
  baseLayout: string,
  route: string,
  title: string,
  description: string,
  renderedContent: string,
  options: {
    css: string;
    scripts?: string;
    tags?: string[];
    robotsMeta?: string;
    ogImageUrl?: string;
    year?: number;
    isArticle?: boolean;
    date?: string;
    updated?: string;
  }
): string {
  const pageTitle = route === "/" ? config.site.title : `${title} - ${config.site.title}`;
  
  return renderPage(baseLayout, {
    route,
    title: pageTitle,
    description,
    content: renderedContent,
    css: options.css,
    scripts: options.scripts || "",
    keywords: generateKeywords(options.tags),
    robotsMeta: options.robotsMeta,
    ogTags: {
      title: pageTitle,
      description,
      url: `${config.site.url}${route}`,
      type: options.isArticle ? "article" : "website",
      siteName: config.site.title,
      ogImageUrl: options.ogImageUrl,
      ogImageWidth: config.site.ogImageWidth,
      ogImageHeight: config.site.ogImageHeight,
      ogImageAlt: config.site.ogImageAlt,
      tags: options.tags,
      publishedTime: options.date,
      modifiedTime: options.updated,
      authorName: config.site.author,
    },
    jsonLd: {
      type: options.isArticle ? "BlogPosting" : "WebPage",
      title,
      description,
      url: `${config.site.url}${route}`,
      date: options.date,
      dateModified: options.updated,
      tags: options.tags,
    },
    breadcrumbs: [
      { name: config.site.title, url: config.site.url },
      { name: title, url: `${config.site.url}${route}` },
    ],
    year: options.year,
  });
}

export async function buildPage(
  route: string,
  filePath: string,
  baseLayout: string,
  contentLayout: string,
  year?: number,
  ogImageUrl?: string,
  cacheManager?: BuildCacheManager,
  hooks?: BuildHooks,
  robotsMeta?: string
): Promise<void> {
  if (cacheManager) {
    const changed = await cacheManager.hasChanged("pages", filePath, filePath);
    if (!changed) {
      console.log(`  (cached) ${route}`);
      return;
    }
  }

  let { frontmatter, html } = await renderMarkdown(filePath);
  const title = frontmatter.title || "Untitled";

  const hookResult = await applyHooks(hooks, "page", route, frontmatter as Record<string, unknown>, html);
  frontmatter = hookResult.frontmatter as FrontMatter;
  html = hookResult.html;

  const hasMermaid = html.includes('class="mermaid"') || checkMermaidCode(html);
  const scripts = hasMermaid ? mermaidScript : "";

  const contentData = { title, content: html };
  const renderedContent = renderTemplate(contentLayout, contentData);

  const inlinedCss = await getInlinedCss();
  const description = buildMetaDescription({
    title,
    primary:
      (frontmatter.summary as string) ||
      (frontmatter.excerpt as string) ||
      (frontmatter.description as string),
    fallbackHtml: html,
    siteDescription: config.site.description,
  });

  let output = buildPageOutput(baseLayout, route, title as string, description, renderedContent, {
    css: inlinedCss,
    scripts,
    tags: frontmatter.tags as string[],
    robotsMeta,
    ogImageUrl,
    year,
  });

  output = await applyAfterHooks(hooks, "page", route, output);

  let outputPath: string;
  if (route === "/") {
    outputPath = join(config.dirs.dist, "index.html");
  } else {
    outputPath = join(config.dirs.dist, route.slice(1), "index.html");
    await ensureDir(dirname(outputPath));
  }

  await writeFileContent(outputPath, output);

  if (cacheManager) {
    await cacheManager.updateMtime("pages", filePath, filePath);
  }
}

export function clearCssCache(): void {
  cssCache = null;
}

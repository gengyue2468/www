import { join, dirname } from "path";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import { hasMermaidCode as checkMermaidCode, mermaidScript } from "../extensions/mermaid.js";
import { renderPage, applyHooks, applyAfterHooks } from "../utils/page-render.js";
import type { BuildHooks } from "../extensions/plugin.js";
import type { BuildCacheManager } from "../utils/cache.js";
import {
  buildMetaDescription,
  generateKeywords,
} from "../utils/seo.js";
import config from "../config.js";

let cachedCss: string | null = null;

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
  let result = css;
  result = deduplicateFontFaces(result);
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");
  result = result.replace(/^\s+/gm, "");
  result = result.replace(/\n{2,}/g, "\n");
  result = result.replace(/\s*([{}:;,])\s*/g, "$1");
  result = result.replace(/;\}/g, "}");
  result = result.replace(/\s+/g, " ");
  result = result.trim();
  return result;
}

export async function getInlinedCss(): Promise<string> {
  if (cachedCss) return cachedCss;

  const { public: publicDir } = config.dirs;
  const tuftePath = join(publicDir, "tufte.css");
  const globalsPath = join(publicDir, "globals.css");

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
    cachedCss = `<style>\n${minified}\n</style>`;
    return cachedCss;
  } catch (_err) {
    console.warn("Warning: Could not read CSS files for inlining");
    return "";
  }
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
    const changed = await cacheManager.hasPageChanged(filePath);
    if (!changed) {
      console.log(`  (cached) ${route}`);
      return;
    }
  }

  let { frontmatter, html } = await renderMarkdown(filePath);
  const title = frontmatter.title || "Untitled";

  const hookResult = await applyHooks(hooks, "page", route, frontmatter as Record<string, unknown>, html);
  frontmatter = hookResult.frontmatter as any;
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

  const pageTitle = route === "/" ? config.site.title : `${title} - ${config.site.title}`;

  let output = renderPage(baseLayout, {
    route,
    title: pageTitle,
    description,
    content: renderedContent,
    css: inlinedCss,
    scripts,
    keywords: generateKeywords(frontmatter.tags as string[]),
    robotsMeta,
    ogTags: {
      title: pageTitle,
      description,
      url: `${config.site.url}${route}`,
      type: "website",
      siteName: config.site.title,
      ogImageUrl,
      ogImageWidth: config.site.ogImageWidth,
      ogImageHeight: config.site.ogImageHeight,
      ogImageAlt: config.site.ogImageAlt,
    },
    jsonLd: {
      type: "WebPage",
      title: title as string,
      description,
      url: `${config.site.url}${route}`,
    },
    breadcrumbs: [
      { name: config.site.title, url: config.site.url },
      { name: title as string, url: `${config.site.url}${route}` },
    ],
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
    await cacheManager.updatePageMtime(filePath);
  }
}

export function clearCssCache(): void {
  cachedCss = null;
}

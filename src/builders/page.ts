import { join, dirname } from "path";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate, renderNav } from "../utils/template.js";
import { hasMermaidCode as checkMermaidCode, mermaidScript } from "../extensions/mermaid.js";
import { generateDefaultOgImage } from "../generators/og-image.js";
import config from "../config.js";

/**
 * Truncate description to optimal length for SEO (150 chars)
 */
function truncateDescription(description: string, maxLength = 150): string {
  if (description.length <= maxLength) return description;
  const truncated = description.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf("。");
  const lastSpace = truncated.lastIndexOf(" ");
  const cutoff = lastPeriod > 0 ? lastPeriod + 1 : (lastSpace > 0 ? lastSpace : maxLength);
  return truncated.substring(0, cutoff) + "...";
}

/**
 * Generate SEO-friendly page title
 * Geek style: clean, minimal, English-based
 */
function generatePageTitle(pageTitle: string, route: string): string {
  const siteName = config.site.title;

  // Route-specific title templates - geek & minimal
  const titleTemplates: Record<string, string> = {
    "/": `${pageTitle} - ${siteName}`,
    "/about": `${pageTitle} - ${siteName}`,
    "/now": `${pageTitle} - ${siteName}`,
    "/blog": `Blog - ${siteName}`,
  };

  // Use template if available, otherwise default format
  return titleTemplates[route] || `${pageTitle} - ${siteName}`;
}

/**
 * Generate Open Graph meta tags
 */
function generateOgTags(title: string, description: string, url: string, type: string, ogImage?: string): string {
  const parts: string[] = [
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${truncateDescription(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${config.site.title}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${truncateDescription(description)}" />`,
  ];

  // Add OG image if provided
  if (ogImage) {
    parts.push(`<meta property="og:image" content="${ogImage}" />`);
    parts.push(`<meta name="twitter:image" content="${ogImage}" />`);
  }

  return parts.join("\n    ");
}

// Cache for CSS content to avoid reading files multiple times
let cachedCss: string | null = null;

/**
 * Get inlined CSS using Bun.file() for fast reading
 */
export async function getInlinedCss(): Promise<string> {
  if (cachedCss) return cachedCss;

  const { public: publicDir } = config.dirs;
  const tuftePath = join(publicDir, "tufte.css");
  const globalsPath = join(publicDir, "globals.css");

  try {
    // Read both files in parallel using Bun.file()
    const [tufteFile, globalsFile] = await Promise.all([
      Bun.file(tuftePath),
      Bun.file(globalsPath),
    ]);

    const [tufteCss, globalsCss] = await Promise.all([
      tufteFile.text(),
      globalsFile.text(),
    ]);

    const combined = `/* tufte.css */\n${tufteCss}\n\n/* globals.css */\n${globalsCss}`;
    cachedCss = `<style>\n${combined}\n</style>`;
    return cachedCss;
  } catch (_err) {
    console.warn("Warning: Could not read CSS files for inlining");
    return "";
  }
}

/**
 * Build a static page
 */
export async function buildPage(
  route: string,
  filePath: string,
  baseLayout: string,
  contentLayout: string,
  year?: number,
  ogImageUrl?: string
): Promise<void> {
  const { frontmatter, html } = await renderMarkdown(filePath);
  const title = frontmatter.title || "Untitled";

  const hasMermaid = html.includes('class="mermaid"') || checkMermaidCode(html);

  const contentData = { title, content: html };
  const renderedContent = renderTemplate(contentLayout, contentData);

  const inlinedCss = await getInlinedCss();
  const scripts = hasMermaid ? mermaidScript : "";

  const pageUrl = `${config.site.url}${route}`;
  const description = (frontmatter.summary as string) || (frontmatter.excerpt as string) || config.site.description;

  const fullTitle = generatePageTitle(title, route);

  const baseData = {
    title: fullTitle,
    siteTitle: config.site.title,
    description: truncateDescription(description),
    author: config.site.author,
    year: year?.toString() || new Date().getFullYear().toString(),
    content: renderedContent,
    css: inlinedCss,
    nav: renderNav(config.nav),
    scripts,
    footerLlms: config.llms?.enabled ? ' | <a href="/llms.txt">llms.txt</a>' : '',
    canonicalUrl: pageUrl,
    keywords: "",
    ogTags: generateOgTags(fullTitle, description, pageUrl, "website", ogImageUrl),
    jsonLd: "",
  };
  const output = renderTemplate(baseLayout, baseData);

  let outputPath: string;
  if (route === "/") {
    outputPath = join(config.dirs.dist, "index.html");
  } else {
    outputPath = join(config.dirs.dist, route.slice(1), "index.html");
    await ensureDir(dirname(outputPath));
  }

  await writeFileContent(outputPath, output);
}

/**
 * Clear the CSS cache (useful for hot reload)
 */
export function clearCssCache(): void {
  cachedCss = null;
}

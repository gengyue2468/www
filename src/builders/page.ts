import { join, dirname } from "path";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate, renderNav } from "../utils/template.js";
import { hasMermaidCode as checkMermaidCode, mermaidScript } from "../extensions/mermaid.js";
import {
  buildMetaDescription,
  escapeHtmlAttr,
  escapeHtmlText,
  smartTruncate,
} from "../utils/seo.js";
import config from "../config.js";

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
function generateOgTags(
  title: string,
  description: string,
  url: string,
  type: string,
  ogImageUrl?: string,
  ogImageWidth?: number,
  ogImageHeight?: number,
  ogImageAlt?: string
): string {
  const safeTitle = escapeHtmlAttr(title);
  const safeDescription = escapeHtmlAttr(smartTruncate(description));
  const safeUrl = escapeHtmlAttr(url);
  const safeType = escapeHtmlAttr(type);
  const safeSiteName = escapeHtmlAttr(config.site.title);

  const parts: string[] = [
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:type" content="${safeType}" />`,
    `<meta property="og:site_name" content="${safeSiteName}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
  ];

  if (ogImageUrl) {
    const safeOgImageUrl = escapeHtmlAttr(ogImageUrl);
    parts.push(`<meta property="og:image" content="${safeOgImageUrl}" />`);
    if (ogImageWidth) parts.push(`<meta property="og:image:width" content="${ogImageWidth}" />`);
    if (ogImageHeight) parts.push(`<meta property="og:image:height" content="${ogImageHeight}" />`);
    if (ogImageAlt) parts.push(`<meta property="og:image:alt" content="${escapeHtmlAttr(ogImageAlt)}" />`);
    parts.push(`<meta name="twitter:image" content="${safeOgImageUrl}" />`);
  }

  return parts.join("\n    ");
}

function generatePageJsonLd(route: string, title: string, description: string): string {
  const baseUrl = config.site.url.replace(/\/$/, "");
  const siteName = config.site.title;
  const authorName = config.site.author;

  if (route === "/" || route === "") {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl + "/",
          name: siteName,
          description: smartTruncate(description),
          author: { "@type": "Person", name: authorName },
        },
        {
          "@type": "WebPage",
          "@id": `${baseUrl}/#webpage`,
          url: baseUrl + "/",
          name: title,
          isPartOf: { "@id": `${baseUrl}/#website` },
        },
      ],
    };
    return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
  }

  const pageUrl = baseUrl + (route === "/" ? "/" : route);
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: pageUrl,
    name: title,
    description: smartTruncate(description),
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: baseUrl + "/",
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
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
  const fullTitle = generatePageTitle(title, route);
  const description = buildMetaDescription({
    title,
    primary:
      (frontmatter.summary as string) ||
      (frontmatter.excerpt as string) ||
      (frontmatter.description as string),
    fallbackHtml: html,
    siteDescription: config.site.description,
  });

  const baseData = {
    title: escapeHtmlText(fullTitle),
    siteTitle: config.site.title,
    description: escapeHtmlAttr(description),
    author: escapeHtmlAttr(config.site.author),
    year: year?.toString() || new Date().getFullYear().toString(),
    content: renderedContent,
    css: inlinedCss,
    nav: renderNav(config.nav),
    scripts,
    footerLlms: config.llms?.enabled ? ' | <a href="/llms.txt">llms.txt</a>' : '',
    canonicalUrl: escapeHtmlAttr(pageUrl),
    keywords: "",
    ogTags: generateOgTags(
      fullTitle,
      description,
      pageUrl,
      "website",
      ogImageUrl,
      config.site.ogImageWidth,
      config.site.ogImageHeight,
      config.site.ogImageAlt
    ),
    jsonLd: generatePageJsonLd(route, fullTitle, description),
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

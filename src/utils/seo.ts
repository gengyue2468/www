import { cleanBaseUrl } from "./url.js";

function safeToISOString(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export interface MetaDescriptionOptions {
  title?: string;
  primary?: string;
  fallbackText?: string;
  fallbackHtml?: string;
  siteDescription: string;
  minLength?: number;
  maxLength?: number;
}

const DEFAULT_MIN_LENGTH = 90;
const DEFAULT_MAX_LENGTH = 160;

export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeHtmlAttr(value: string): string {
  return escapeHtmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlToPlainText(html: string): string {
  return normalizeText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

export function smartTruncate(text: string, maxLength = DEFAULT_MAX_LENGTH): string {
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const boundaryChars = ["。", "！", "？", ".", "!", "?", "，", ",", "；", ";", " "];

  let bestCut = -1;
  for (const char of boundaryChars) {
    const index = cut.lastIndexOf(char);
    if (index > bestCut) {
      bestCut = index;
    }
  }

  if (bestCut >= Math.floor(maxLength * 0.6)) {
    return cut.slice(0, bestCut + 1).trim();
  }

  return `${cut.trimEnd()}...`;
}

export function buildMetaDescription(options: MetaDescriptionOptions): string {
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;

  const title = normalizeText(options.title || "");
  const primary = normalizeText(options.primary || "");
  const fallback = normalizeText(options.fallbackText || htmlToPlainText(options.fallbackHtml || ""));
  const siteDescription = normalizeText(options.siteDescription || "");

  let description = primary || fallback || siteDescription || title;

  const usedSiteDefault = description === siteDescription;
  if (usedSiteDefault && title) {
    description = `${title} - ${description}`;
  }

  if (description.length < minLength) {
    const extraParts = [fallback, siteDescription].filter(Boolean);
    for (const part of extraParts) {
      if (description.length >= minLength) break;
      if (description.includes(part)) continue;
      description = normalizeText(`${description} ${part}`);
    }
  }

  if (!description) {
    description = siteDescription || title;
  }

  return smartTruncate(description, maxLength);
}

export function generateKeywords(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "";
  const keywords = tags.join(", ");
  return `<meta name="keywords" content="${escapeHtmlAttr(keywords)}" />`;
}

export interface OgTagsOptions {
  title: string;
  description: string;
  url: string;
  type: string;
  siteName: string;
  tags?: string[];
  ogImageUrl?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
}

export function generateOgTags(options: OgTagsOptions): string {
  const { title, description, url, type, siteName, tags, ogImageUrl, ogImageWidth, ogImageHeight, ogImageAlt, publishedTime, modifiedTime, authorName } = options;
  const safeTitle = escapeHtmlAttr(title);
  const safeDescription = escapeHtmlAttr(description);
  const safeUrl = escapeHtmlAttr(url);

  const parts: string[] = [
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDescription}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:type" content="${escapeHtmlAttr(type)}" />`,
    `<meta property="og:site_name" content="${escapeHtmlAttr(siteName)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDescription}" />`,
  ];

  if (type === "article") {
    const pubIso = safeToISOString(publishedTime);
    const modIso = safeToISOString(modifiedTime);
    if (pubIso) parts.push(`<meta property="article:published_time" content="${pubIso}" />`);
    if (modIso) parts.push(`<meta property="article:modified_time" content="${modIso}" />`);
    if (authorName) parts.push(`<meta property="article:author" content="${escapeHtmlAttr(authorName)}" />`);
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        parts.push(`<meta property="article:tag" content="${escapeHtmlAttr(tag)}" />`);
      }
    }
  }

  if (ogImageUrl) {
    const safeOgImageUrl = escapeHtmlAttr(ogImageUrl);
    parts.push(`<meta property="og:image" content="${safeOgImageUrl}" />`);
    if (ogImageWidth) parts.push(`<meta property="og:image:width" content="${ogImageWidth}" />`);
    if (ogImageHeight) parts.push(`<meta property="og:image:height" content="${ogImageHeight}" />`);
    if (ogImageAlt) parts.push(`<meta property="og:image:alt" content="${escapeHtmlAttr(ogImageAlt)}" />`);
    parts.push(`<meta name="twitter:image" content="${safeOgImageUrl}" />`);
  }

  if (tags && tags.length > 0) {
    parts.push(`<meta name="twitter:label1" content="标签" />`);
    parts.push(`<meta name="twitter:data1" content="${escapeHtmlAttr(tags.slice(0, 3).join(", "))}" />`);
  }

  return parts.join("\n    ");
}

export interface JsonLdOptions {
  type: "WebPage" | "WebSite" | "BlogPosting" | "CollectionPage";
  title: string;
  description: string;
  url: string;
  siteName: string;
  authorName: string;
  siteUrl: string;
  date?: string;
  dateModified?: string;
  tags?: string[];
  numberOfItems?: number;
  breadcrumbs?: { name: string; url: string }[];
}

function buildBreadcrumbLd(breadcrumbs: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": crumb.name,
      "item": crumb.url,
    })),
  };
}

function buildWebSiteLd(options: JsonLdOptions, baseUrl: string): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl + "/",
    name: options.siteName,
    description: smartTruncate(options.description),
    author: { "@type": "Person", name: options.authorName },
    publisher: {
      "@type": "Organization",
      name: options.siteName,
      logo: { "@type": "ImageObject", url: `${baseUrl}/static/logo.webp` },
    },
  };
}

function buildWebPageLd(options: JsonLdOptions, baseUrl: string): Record<string, unknown> {
  return {
    "@type": "WebPage",
    "@id": `${baseUrl}/#webpage`,
    url: options.url,
    name: options.title,
    isPartOf: { "@id": `${baseUrl}/#website` },
  };
}

function buildHomePageJsonLd(options: JsonLdOptions, baseUrl: string): string {
  const graph: Record<string, unknown>[] = [
    buildWebSiteLd(options, baseUrl),
    buildWebPageLd(options, baseUrl),
  ];

  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    graph.push(buildBreadcrumbLd(options.breadcrumbs));
  }

  const data = { "@context": "https://schema.org", "@graph": graph };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

function buildRegularPageJsonLd(options: JsonLdOptions, baseUrl: string): string {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: options.url,
    name: options.title,
    description: smartTruncate(options.description),
    isPartOf: { "@type": "WebSite", name: options.siteName, url: baseUrl + "/" },
  };

  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    const wrapped = { "@context": "https://schema.org", "@graph": [data, buildBreadcrumbLd(options.breadcrumbs)] };
    return `<script type="application/ld+json">\n${JSON.stringify(wrapped, null, 2)}\n</script>`;
  }

  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

function buildBlogPostingJsonLd(options: JsonLdOptions, baseUrl: string): string {
  const data: Record<string, unknown> = {
    "@type": "BlogPosting",
    headline: options.title,
    description: smartTruncate(options.description),
    url: options.url,
    author: { "@type": "Person", name: options.authorName },
    publisher: {
      "@type": "Organization",
      name: options.siteName,
      logo: { "@type": "ImageObject", url: `${baseUrl}/static/logo.webp` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": options.url },
  };

  data.datePublished = safeToISOString(options.date);
  data.dateModified = safeToISOString(options.dateModified) || safeToISOString(options.date);
  if (options.tags && options.tags.length > 0) data.keywords = options.tags.join(", ");

  return wrapWithBreadcrumbs(data, options.breadcrumbs);
}

function buildCollectionPageJsonLd(options: JsonLdOptions, baseUrl: string): string {
  const data: Record<string, unknown> = {
    "@type": "CollectionPage",
    headline: options.title,
    description: smartTruncate(options.description),
    url: options.url,
  };

  if (options.numberOfItems !== undefined) {
    data.numberOfItems = options.numberOfItems;
    data.isPartOf = { "@type": "WebSite", name: options.siteName, url: baseUrl + "/" };
  }

  data.datePublished = safeToISOString(options.date);
  data.dateModified = safeToISOString(options.dateModified) || safeToISOString(options.date);
  if (options.tags && options.tags.length > 0) data.keywords = options.tags.join(", ");

  return wrapWithBreadcrumbs(data, options.breadcrumbs);
}

function wrapWithBreadcrumbs(data: Record<string, unknown>, breadcrumbs?: { name: string; url: string }[]): string {
  if (breadcrumbs && breadcrumbs.length > 0) {
    const wrapped = { "@context": "https://schema.org", "@graph": [data, buildBreadcrumbLd(breadcrumbs)] };
    return `<script type="application/ld+json">\n${JSON.stringify(wrapped, null, 2)}\n</script>`;
  }
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

export function generateJsonLd(options: JsonLdOptions): string {
  const baseUrl = cleanBaseUrl(options.siteUrl);
  const isHomePage = options.url === baseUrl + "/" || options.url === baseUrl;

  switch (options.type) {
    case "WebSite":
    case "WebPage":
      return isHomePage
        ? buildHomePageJsonLd(options, baseUrl)
        : buildRegularPageJsonLd(options, baseUrl);
    case "BlogPosting":
      return buildBlogPostingJsonLd(options, baseUrl);
    case "CollectionPage":
      return buildCollectionPageJsonLd(options, baseUrl);
    default:
      return buildRegularPageJsonLd(options, baseUrl);
  }
}

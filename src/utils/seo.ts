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
    if (publishedTime) parts.push(`<meta property="article:published_time" content="${new Date(publishedTime).toISOString()}" />`);
    if (modifiedTime) parts.push(`<meta property="article:modified_time" content="${new Date(modifiedTime).toISOString()}" />`);
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

export function generateJsonLd(options: JsonLdOptions): string {
  const { type, title, description, url, siteName, authorName, siteUrl, date, dateModified, tags, numberOfItems, breadcrumbs } = options;
  const baseUrl = siteUrl.replace(/\/$/, "");

  const breadcrumbLd = breadcrumbs && breadcrumbs.length > 0
    ? {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": crumb.name,
          "item": crumb.url,
        })),
      }
    : null;

  if (type === "WebSite" || type === "WebPage") {
    if (url === baseUrl + "/" || url === baseUrl) {
      const graph: Record<string, unknown>[] = [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl + "/",
          name: siteName,
          description: smartTruncate(description),
          author: { "@type": "Person", name: authorName },
          publisher: {
            "@type": "Organization",
            name: siteName,
            logo: { "@type": "ImageObject", url: `${baseUrl}/static/logo.webp` },
          },
        },
        {
          "@type": "WebPage",
          "@id": `${baseUrl}/#webpage`,
          url,
          name: title,
          isPartOf: { "@id": `${baseUrl}/#website` },
        },
      ];
      if (breadcrumbLd) graph.push(breadcrumbLd);
      const data = { "@context": "https://schema.org", "@graph": graph };
      return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
    }

    const graph: Record<string, unknown>[] = [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        url,
        name: title,
        description: smartTruncate(description),
        isPartOf: { "@type": "WebSite", name: siteName, url: baseUrl + "/" },
      },
    ];
    if (breadcrumbLd) {
      const data = { "@context": "https://schema.org", "@graph": [...graph, breadcrumbLd] };
      return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
    }
    return `<script type="application/ld+json">\n${JSON.stringify(graph[0], null, 2)}\n</script>`;
  }

  const data: Record<string, unknown> = {
    "@type": type,
    headline: title,
    description: smartTruncate(description),
    url,
  };

  if (type === "BlogPosting") {
    data.author = { "@type": "Person", name: authorName };
    data.publisher = {
      "@type": "Organization",
      name: siteName,
      logo: { "@type": "ImageObject", url: `${baseUrl}/static/logo.webp` },
    };
    data.mainEntityOfPage = { "@type": "WebPage", "@id": url };
  }

  if (type === "CollectionPage" && numberOfItems !== undefined) {
    data.numberOfItems = numberOfItems;
    data.isPartOf = { "@type": "WebSite", name: siteName, url: baseUrl + "/" };
  }

  if (date) data.datePublished = new Date(date).toISOString();
  if (dateModified) {
    data.dateModified = new Date(dateModified).toISOString();
  } else if (date) {
    data.dateModified = new Date(date).toISOString();
  }
  if (tags && tags.length > 0) data.keywords = tags.join(", ");

  if (breadcrumbLd) {
    const wrapped = { "@context": "https://schema.org", "@graph": [data, breadcrumbLd] };
    return `<script type="application/ld+json">\n${JSON.stringify(wrapped, null, 2)}\n</script>`;
  }

  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

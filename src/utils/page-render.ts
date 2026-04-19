import { renderTemplate, renderNav } from "./template.js";
import { escapeHtmlAttr, escapeHtmlText, generateOgTags, generateJsonLd } from "./seo.js";
import type { OgTagsOptions, JsonLdOptions } from "./seo.js";
import type { BuildHooks } from "../extensions/plugin.js";
import config from "../config.js";

export type JsonLdInput = Omit<JsonLdOptions, "siteName" | "authorName" | "siteUrl">;

export interface RenderPageOptions {
  route: string;
  title: string;
  description: string;
  content: string;
  css: string;
  scripts?: string;
  keywords?: string;
  ogTags: OgTagsOptions;
  jsonLd: JsonLdInput;
  year?: number;
  hooks?: BuildHooks;
  hookType?: "page" | "post";
  hookSlug?: string;
  robotsMeta?: string;
}

export function renderPage(
  baseLayout: string,
  options: RenderPageOptions
): string {
  const {
    route,
    title,
    description,
    content,
    css,
    scripts = "",
    keywords = "",
    ogTags,
    jsonLd,
    year,
    robotsMeta = "",
  } = options;

  const fullTitle = title;
  const pageUrl = `${config.site.url}${route}`;
  const ogImageBase = config.site.ogImage
    ? (config.cdn || config.site.url).replace(/\/$/, "") + config.site.ogImage
    : undefined;

  const analytics = config.analytics.enabled
    ? `<link rel="dns-prefetch" href="${new URL(config.analytics.scriptUrl).origin}" />\n<link rel="preconnect" href="${new URL(config.analytics.scriptUrl).origin}" crossorigin />\n<script defer src="${config.analytics.scriptUrl}" data-website-id="${config.analytics.websiteId}"></script>`
    : "";

  const baseData = {
    title: escapeHtmlText(fullTitle),
    siteTitle: config.site.title,
    description: escapeHtmlAttr(description),
    author: escapeHtmlAttr(config.site.author),
    year: (year || new Date().getFullYear()).toString(),
    content,
    css,
    nav: renderNav(config.nav),
    scripts,
    analytics,
    footerLlms: config.llms?.enabled ? ' | <a href="/llms.txt">llms.txt</a>' : '',
    canonicalUrl: escapeHtmlAttr(pageUrl),
    keywords,
    robotsMeta,
    ogTags: generateOgTags({
      ...ogTags,
      ogImageUrl: ogTags.ogImageUrl || ogImageBase,
      ogImageWidth: ogTags.ogImageWidth || config.site.ogImageWidth,
      ogImageHeight: ogTags.ogImageHeight || config.site.ogImageHeight,
      ogImageAlt: ogTags.ogImageAlt || config.site.ogImageAlt,
    }),
    jsonLd: generateJsonLd({
      ...jsonLd,
      siteName: config.site.title,
      authorName: config.site.author,
      siteUrl: config.site.url,
    }),
  };

  return renderTemplate(baseLayout, baseData);
}

export async function applyHooks(
  hooks: BuildHooks | undefined,
  type: "page" | "post",
  slug: string,
  frontmatter: Record<string, unknown>,
  html: string
): Promise<{ frontmatter: Record<string, unknown>; html: string }> {
  if (!hooks) return { frontmatter, html };

  if (type === "page" && hooks.beforeRenderPage) {
    const r = hooks.beforeRenderPage(slug, { frontmatter: frontmatter as any, html });
    const result = r instanceof Promise ? await r : r;
    return { frontmatter: result.frontmatter as Record<string, unknown>, html: result.html };
  }

  if (type === "post" && hooks.beforeRenderPost) {
    const r = hooks.beforeRenderPost(slug, { frontmatter: frontmatter as any, html });
    const result = r instanceof Promise ? await r : r;
    return { frontmatter: result.frontmatter as Record<string, unknown>, html: result.html };
  }

  return { frontmatter, html };
}

export async function applyAfterHooks(
  hooks: BuildHooks | undefined,
  type: "page" | "post",
  slug: string,
  html: string
): Promise<string> {
  if (!hooks) return html;

  if (type === "page" && hooks.afterRenderPage) {
    const r = hooks.afterRenderPage(slug, html);
    return r instanceof Promise ? await r : r;
  }

  if (type === "post" && hooks.afterRenderPost) {
    const r = hooks.afterRenderPost(slug, html);
    return r instanceof Promise ? await r : r;
  }

  return html;
}

import { renderTemplate, renderNav } from "./template.js";
import { escapeHtmlAttr, escapeHtmlText, generateOgTags, generateJsonLd } from "./seo.js";
import type { OgTagsOptions, JsonLdOptions } from "./seo.js";
import { cleanBaseUrl } from "./url.js";
import type { BuildHooks } from "../extensions/plugin.js";
import type { RenderedContent } from "../types.js";
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
  breadcrumbs?: { name: string; url: string }[];
  headLinks?: string;
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
    breadcrumbs,
    headLinks = "",
  } = options;

  const fullTitle = title;
  const pageUrl = `${config.site.url}${route}`;
  const ogImageBase = config.site.ogImage
    ? cleanBaseUrl(config.cdn || config.site.url) + config.site.ogImage
    : undefined;

  let analytics = "";
  if (config.analytics.enabled && config.analytics.scriptUrl) {
    try {
      const origin = new URL(config.analytics.scriptUrl).origin;
      analytics = `<link rel="dns-prefetch" href="${origin}" />\n<link rel="preconnect" href="${origin}" crossorigin />\n<script defer src="${config.analytics.scriptUrl}" data-website-id="${config.analytics.websiteId}"></script>`;
    } catch {
      analytics = `<script defer src="${config.analytics.scriptUrl}" data-website-id="${config.analytics.websiteId}"></script>`;
    }
  }

  const baseData = {
    title: escapeHtmlText(fullTitle),
    siteTitle: config.site.title,
    description: escapeHtmlAttr(description),
    author: escapeHtmlAttr(config.site.author),
    year: (year || new Date().getFullYear()).toString(),
    content,
    css,
    nav: renderNav(config.nav, route),
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
      breadcrumbs,
    }),
    headLinks,
  };

  return renderTemplate(baseLayout, baseData);
}

type HookType = "page" | "post";

interface HookContent {
  frontmatter: Record<string, unknown>;
  html: string;
}

export async function applyHooks(
  hooks: BuildHooks | undefined,
  type: HookType,
  slug: string,
  frontmatter: Record<string, unknown>,
  html: string
): Promise<HookContent> {
  if (!hooks) return { frontmatter, html };

  const hookFn = type === "page" ? hooks.beforeRenderPage : hooks.beforeRenderPost;
  if (!hookFn) return { frontmatter, html };

  const content: RenderedContent = { frontmatter: frontmatter as RenderedContent["frontmatter"], html };
  const result = await hookFn(slug, content);
  return { frontmatter: result.frontmatter as Record<string, unknown>, html: result.html };
}

export async function applyAfterHooks(
  hooks: BuildHooks | undefined,
  type: HookType,
  slug: string,
  html: string
): Promise<string> {
  if (!hooks) return html;

  const hookFn = type === "page" ? hooks.afterRenderPage : hooks.afterRenderPost;
  if (!hookFn) return html;

  return hookFn(slug, html);
}

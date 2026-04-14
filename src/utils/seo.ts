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

/**
 * Escape text for safe HTML text-node usage.
 */
export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escape text for safe HTML attribute usage.
 */
export function escapeHtmlAttr(value: string): string {
  return escapeHtmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Convert rich HTML into plain text for snippet generation.
 */
export function htmlToPlainText(html: string): string {
  return normalizeText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

/**
 * Normalize whitespace and trim content.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncate text at semantic boundaries while keeping a natural ending.
 */
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

/**
 * Build a unique, SEO-friendly meta description with length constraints.
 */
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

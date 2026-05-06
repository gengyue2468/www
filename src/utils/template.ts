import type { NavItem } from "../types.js";
import { escapeHtmlAttr, escapeHtmlText } from "./seo.js";

const TEMPLATE_REGEX_CACHE = new Map<string, RegExp>();
const PLACEHOLDER_PREFIX = "\x00TPL";
const PLACEHOLDER_SUFFIX = "\x00";

const CONTENT_KEYS = new Set(["content", "scripts", "css"]);

function getTemplateRegex(key: string): RegExp {
  let regex = TEMPLATE_REGEX_CACHE.get(key);
  if (!regex) {
    regex = new RegExp(`{{${key}}}`, "g");
    TEMPLATE_REGEX_CACHE.set(key, regex);
  }
  return regex;
}

export function renderTemplate(
  template: string,
  data: Record<string, string>
): string {
  const placeholders = new Map<string, string>();
  const safeData: Record<string, string> = {};

  let placeholderIndex = 0;
  for (const [key, value] of Object.entries(data)) {
    if (CONTENT_KEYS.has(key) && value.includes("{{")) {
      const safe = value.replace(/\{\{/g, `${PLACEHOLDER_PREFIX}${placeholderIndex}${PLACEHOLDER_SUFFIX}`);
      placeholders.set(`${PLACEHOLDER_PREFIX}${placeholderIndex}${PLACEHOLDER_SUFFIX}`, "{{");
      safeData[key] = safe;
      placeholderIndex++;
    } else {
      safeData[key] = value;
    }
  }

  let result = template;
  for (const [key, value] of Object.entries(safeData)) {
    const regex = getTemplateRegex(key);
    result = result.replace(regex, value);
  }

  for (const [placeholder, original] of placeholders) {
    result = result.replaceAll(placeholder, original);
  }

  return result;
}

export function renderNav(navItems: NavItem[], currentPath?: string): string {
  const parts: string[] = [];
  for (const item of navItems) {
    if (item.show) {
      let isCurrent = false;
      if (currentPath) {
        if (item.path === currentPath) {
          isCurrent = true;
        } else if (item.path !== "/" && currentPath.startsWith(item.path + "/")) {
          isCurrent = true;
        }
      }
      const ariaCurrent = isCurrent ? ' aria-current="page"' : "";
      const safePath = escapeHtmlAttr(item.path);
      const safeName = escapeHtmlText(item.name);
      parts.push(`<a href="${safePath}"${ariaCurrent}>${safeName}</a>`);
    }
  }
  return parts.join("\n      ");
}

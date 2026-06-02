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

      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some((child) => {
          if (!currentPath) return false;
          if (child.path === currentPath) return true;
          if (child.path !== "/" && currentPath.startsWith(child.path + "/")) return true;
          return false;
        });
        const summaryClass = hasActiveChild ? " active" : "";
        const links: string[] = [];
        for (const child of item.children) {
          if (!child.show) continue;
          const childIsCurrent = currentPath && (child.path === currentPath || (child.path !== "/" && currentPath.startsWith(child.path + "/")));
          const ariaCurrent = childIsCurrent ? ' aria-current="page"' : "";
          const safePath = escapeHtmlAttr(child.path);
          const safeName = escapeHtmlText(child.name);
          const target = child.external ? ' target="_blank" rel="noopener"' : "";
          links.push(`<a href="${safePath}"${target}${ariaCurrent}>${safeName}</a>`);
        }
        parts.push(
          `<span class="nav-dropdown-wrapper"><input type="checkbox" id="nav-menu-checkbox" class="nav-menu-checkbox" aria-hidden="true"><label class="nav-menu-overlay" for="nav-menu-checkbox" aria-hidden="true"></label><label class="nav-menu-label${summaryClass}" for="nav-menu-checkbox">${escapeHtmlText(item.name)}</label><div class="nav-dropdown-menu">${links.join("")}</div></span>`
        );
      } else {
        const ariaCurrent = isCurrent ? ' aria-current="page"' : "";
        const safePath = escapeHtmlAttr(item.path);
        const safeName = escapeHtmlText(item.name);
        parts.push(`<a href="${safePath}"${ariaCurrent}>${safeName}</a>`);
      }
    }
  }
  return parts.join("\n      ");
}

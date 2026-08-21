import type { NavItem } from "../types.js";
import { escapeHtmlAttr, escapeHtmlText } from "./seo.js";

const TEMPLATE_TOKEN = /{{([A-Za-z][A-Za-z0-9_-]*)}}/g;

export function renderTemplate(
  template: string,
  data: Record<string, string>
): string {
  return template.replace(TEMPLATE_TOKEN, (token, key: string) => data[key] ?? token);
}

export function renderNav(navItems: NavItem[], currentPath?: string): string {
  const parts: string[] = [];
  let dropdownIndex = 0;
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
        const menuId = `nav-menu-checkbox-${dropdownIndex++}`;
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
          `<span class="nav-dropdown-wrapper"><input type="checkbox" id="${menuId}" class="nav-menu-checkbox" aria-label="${escapeHtmlAttr(item.name)}"><label class="nav-menu-overlay" for="${menuId}" aria-hidden="true"></label><label class="nav-menu-label${summaryClass}" for="${menuId}">${escapeHtmlText(item.name)}</label><div class="nav-dropdown-menu">${links.join("")}</div></span>`
        );
      } else {
        const ariaCurrent = isCurrent ? ' aria-current="page"' : "";
        const safePath = escapeHtmlAttr(item.path);
        const safeName = escapeHtmlText(item.name);
        const target = item.external ? ' target="_blank" rel="noopener"' : "";
        parts.push(`<a href="${safePath}"${target}${ariaCurrent}>${safeName}</a>`);
      }
    }
  }
  return parts.join("\n      ");
}

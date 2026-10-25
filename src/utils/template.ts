import type { NavItem } from "../types.js";
import { escapeHtmlAttr, escapeHtmlText } from "./seo.js";
import { renderDropdown, renderDropdownGroup } from "../extensions/dropdown.js";

const TEMPLATE_TOKEN = /{{([A-Za-z][A-Za-z0-9_-]*)}}/g;

export function renderTemplate(
  template: string,
  data: Record<string, string>
): string {
  return template.replace(TEMPLATE_TOKEN, (token, key: string) => data[key] ?? token);
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
          if (!currentPath || !child.show) return false;
          if (child.path === currentPath) return true;
          if (child.path !== "/" && currentPath.startsWith(child.path + "/")) return true;
          return false;
        });
        const links: string[] = [];
        let group: string | undefined;
        let groupedLinks: string[] = [];
        const flushGroup = () => {
          const content = groupedLinks.join("");
          links.push(group ? renderDropdownGroup(group, content) : content);
          groupedLinks = [];
        };
        for (const child of item.children) {
          if (!child.show) continue;
          if (child.group !== group) {
            flushGroup();
            group = child.group;
          }
          const childIsCurrent = currentPath && (child.path === currentPath || (child.path !== "/" && currentPath.startsWith(child.path + "/")));
          const ariaCurrent = childIsCurrent ? ' aria-current="page"' : "";
          const safePath = escapeHtmlAttr(child.path);
          const safeName = escapeHtmlText(child.name);
          const target = child.external ? ' target="_blank" rel="noopener"' : "";
          groupedLinks.push(`<a href="${safePath}"${target}${ariaCurrent}>${safeName}</a>`);
        }
        flushGroup();
        parts.push(renderDropdown(item.name, links.join(""), { active: hasActiveChild }));
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

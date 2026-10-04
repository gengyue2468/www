import type { Plugin } from "./plugin.js";
import { escapeHtmlAttr, escapeHtmlText } from "../utils/seo.js";

/** The caller provides rendered menu HTML; the trigger is always plain text. */
export function renderDropdown(label: string, content: string, options: { triggerClass?: string; active?: boolean } = {}): string {
  const classes = `nav-menu-label${options.triggerClass ? ` ${options.triggerClass}` : ""}${options.active ? " active" : ""}`;
  return `<site-dropdown><details class="nav-dropdown"><summary class="${escapeHtmlAttr(classes)}">${escapeHtmlText(label)}</summary><div class="nav-dropdown-menu">${content}</div></details></site-dropdown>`;
}

export const dropdownPlugin: Plugin = {
  name: "site-dropdown",
  webComponents: [{ tagName: "site-dropdown", scriptKey: "site-dropdown" }],
  clientScripts: [{ key: "site-dropdown", fileName: "site-dropdown", sourcePath: "js/site-dropdown.js" }],
};

import type { Plugin } from "./plugin.js";
import { escapeHtmlAttr, escapeHtmlText } from "../utils/seo.js";

interface ContentTab {
  title: string;
  html: string;
}

function renderTabButton(title: string, id: string, selected: boolean): string {
  const safeId = escapeHtmlAttr(id);
  return `<button class="tab-button" type="button" id="${safeId}" role="tab" aria-selected="${selected}" ` +
    `aria-controls="${safeId}-content" tabindex="${selected ? 0 : -1}">${escapeHtmlText(title)}</button>`;
}

function renderPanelOpening(id: string, selected: boolean): string {
  const safeId = escapeHtmlAttr(id);
  return `<div class="tab-content" id="${safeId}-content" role="tabpanel" aria-labelledby="${safeId}"${selected ? "" : " hidden"}>`;
}

function renderTabsOpening(buttons: string[]): string {
  return `<div class="tabs-container"><content-tabs class="tabs"><div class="tab-list" role="tablist" aria-label="标签页">${buttons.join("\n")}</div><div class="tab-panels">`;
}

const TABS_CLOSING = "</div></content-tabs></div>";

/** HTML content is rendered and sanitized by the caller; titles are plain text. */
export function renderContentTabs(tabs: ContentTab[], idPrefix: string): string {
  const buttons = tabs.map((tab, index) => renderTabButton(tab.title, `${idPrefix}-${index}`, index === 0));
  const panels = tabs.map((tab, index) => `${renderPanelOpening(`${idPrefix}-${index}`, index === 0)}${tab.html}</div>`);
  return `${renderTabsOpening(buttons)}${panels.join("\n")}${TABS_CLOSING}`;
}

export const contentTabsPlugin: Plugin = {
  name: "content-tabs",
  containers: [
    {
      type: "tabs",
      validate: params => params.trim().match(/^tabs\s*$/),
      render(tokens, idx, _options, env) {
        const opening = tokens[idx];
        if (opening.nesting === -1) return `${TABS_CLOSING}\n`;
        const buttons: string[] = [];
        const idPrefix = `${env?.tabIdPrefix || "content"}-tabs-${idx}`;
        for (let cursor = idx + 1; cursor < tokens.length; cursor++) {
          const token = tokens[cursor];
          if (token.type === "container_tabs_close" && token.level === opening.level) break;
          if (token.type !== "container_tab-item_open" || token.level !== opening.level + 1) continue;
          const id = `${idPrefix}-${buttons.length}`;
          const selected = buttons.length === 0;
          token.meta = { ...token.meta, contentTab: { id, selected } };
          const title = token.info.trim().replace(/^tab-item\s+/, "");
          buttons.push(renderTabButton(title, id, selected));
        }
        return `${renderTabsOpening(buttons)}\n`;
      },
    },
    {
      type: "tab-item",
      validate: params => params.trim().match(/^tab-item\s+\S/),
      render(tokens, idx) {
        if (tokens[idx].nesting === -1) return "</div>\n";
        const tab = tokens[idx].meta?.contentTab;
        return tab ? `${renderPanelOpening(tab.id, tab.selected)}\n` : '<div class="tab-content">\n';
      },
    },
  ],
  webComponents: [{ tagName: "content-tabs", scriptKey: "content-tabs" }],
  clientScripts: [{ key: "content-tabs", fileName: "content-tabs", sourcePath: "js/content-tabs.js" }],
};

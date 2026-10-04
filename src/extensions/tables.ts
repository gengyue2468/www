import type { Plugin } from "./plugin.js";
import type { RenderedContent } from "../types.js";

/** Keep native column sizing inside a separate, keyboard-scrollable viewport. */
export function processTables(html: string): string {
  let existingWrapper = 0;
  return new HTMLRewriter()
    .on(".table-scroll", {
      element(element) {
        existingWrapper++;
        element.onEndTag(() => { existingWrapper--; });
      },
    })
    .on("table", {
      element(element) {
        if (existingWrapper) return;
        element.before('<div class="table-scroll" tabindex="0" role="region" aria-label="表格，可横向滚动">', { html: true });
        element.after("</div>", { html: true });
      },
    })
    .on("table th br, table td br", {
      element(element) {
        element.replace(" ");
      },
    })
    .transform(html);
}

function enhanceContent(_route: string, content: RenderedContent): RenderedContent {
  return { ...content, html: processTables(content.html) };
}

export const tablesPlugin: Plugin = {
  name: "tables",
  hooks: { beforeRenderPage: enhanceContent, beforeRenderPost: enhanceContent },
};

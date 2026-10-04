import type { Plugin } from "./plugin.js";
import type { RenderedContent } from "../types.js";

export function processCodeBlocks(html: string): string {
  let excluded = 0;
  return new HTMLRewriter()
    .on("code-block, mermaid-diagram, pre.ascii-art", {
      element(element) {
        excluded++;
        element.onEndTag(() => { excluded--; });
      },
    })
    .on("pre", {
      element(element) {
        if (excluded) return;
        element.before("<code-block>", { html: true });
        element.after("</code-block>", { html: true });
      },
    })
    .transform(html);
}

function enhanceContent(_route: string, content: RenderedContent): RenderedContent {
  return { ...content, html: processCodeBlocks(content.html) };
}

export const codeBlockPlugin: Plugin = {
  name: "code-block",
  hooks: { beforeRenderPage: enhanceContent, beforeRenderPost: enhanceContent },
  webComponents: [{ tagName: "code-block", scriptKey: "code-block" }],
  clientScripts: [{ key: "code-block", fileName: "code-block", sourcePath: "js/code-block.js" }],
};

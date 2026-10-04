import type { Plugin } from "./plugin.js";
import type { RenderedContent } from "../types.js";
import { escapeHtmlAttr } from "../utils/seo.js";
import config from "../config.js";
import { getMarkdownIt } from "../utils/markdown.js";

function decodeAttribute(value: string): string {
  // HTMLRewriter returns raw entities. Preserve literal backslashes while using
  // MarkdownIt's existing entity decoder, then escape for the new attribute.
  return getMarkdownIt().utils.unescapeAll(value.replace(/\\/g, "\\\\"));
}

export function processImageViewers(html: string): string {
  let excluded = 0;
  return new HTMLRewriter()
    .on("a, button, pre, code, svg, picture, image-viewer, [data-no-viewer]", {
      element(element) {
        // Images themselves are void elements, and have no end-tag callback.
        if (["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(element.tagName)) return;
        excluded++;
        element.onEndTag(() => { excluded--; });
      },
    })
    .on("img", {
      element(element) {
        const rawSrc = element.getAttribute("src");
        const src = rawSrc ? decodeAttribute(rawSrc) : "";
        if (excluded || !src || element.hasAttribute("data-no-viewer")
          || element.getAttribute("aria-hidden") === "true"
          || element.getAttribute("role") === "presentation"
          || element.getAttribute("class")?.split(/\s+/).includes("ttyd-mascot")) return;
        try {
          if (!["https:", "http:"].includes(new URL(src, config.site.url).protocol)) return;
        } catch {
          return;
        }
        const label = decodeAttribute(element.getAttribute("alt") || "").trim() || "图片";
        element.before(
          `<image-viewer><a class="image-viewer-link" href="${escapeHtmlAttr(src)}" aria-label="${escapeHtmlAttr(`查看大图：${label}`)}">`,
          { html: true },
        );
        element.after("</a></image-viewer>", { html: true });
      },
    })
    .transform(html);
}

function enhanceContent(_route: string, content: RenderedContent): RenderedContent {
  return { ...content, html: processImageViewers(content.html) };
}

export const imageViewerPlugin: Plugin = {
  name: "image-viewer",
  hooks: { beforeRenderPage: enhanceContent, beforeRenderPost: enhanceContent },
  webComponents: [{ tagName: "image-viewer", scriptKey: "image-viewer" }],
  clientScripts: [{ key: "image-viewer", fileName: "image-viewer", sourcePath: "js/image-viewer.js" }],
};

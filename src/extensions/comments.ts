import type { Plugin } from "./plugin.js";
import { escapeHtmlAttr } from "../utils/seo.js";
import config from "../config.js";

const COMPONENT_TAG = "isso-comments";

export function generateIssoCommentsHTML(route: string, title: string): string {
  const capAttributes = config.isso.cap.enabled
    ? ` data-cap-enabled="true" data-cap-script="${escapeHtmlAttr(config.isso.cap.widgetScriptUrl)}" data-cap-endpoint="${escapeHtmlAttr(config.isso.cap.apiEndpoint)}"`
    : "";
  return `<section class="post-comments" aria-labelledby="post-comments-title">
  <h2 id="post-comments-title"><span class="post-comments-count" aria-live="polite"></span>评论</h2>
  <isso-comments
    data-isso-script="${escapeHtmlAttr(config.isso.scriptUrl)}"
    data-isso-endpoint="${escapeHtmlAttr(config.isso.endpoint)}"
    data-isso-page-author-hashes="${escapeHtmlAttr(config.isso.pageAuthorHashes)}"${capAttributes}
  >
    <div id="isso-thread" data-isso-id="${escapeHtmlAttr(route)}" data-title="${escapeHtmlAttr(title)}">
      <noscript>需要启用 JavaScript 才能查看和发表评论。</noscript>
    </div>
  </isso-comments>
</section>`;
}

export const commentsPlugin: Plugin = {
  name: "isso-comments",
  clientScripts: [{
    key: "isso-comments",
    fileName: "isso-comments",
    sourcePath: "js/comments.js",
  }],
  webComponents: [{
    tagName: COMPONENT_TAG,
    scriptKey: "isso-comments",
  }],
};

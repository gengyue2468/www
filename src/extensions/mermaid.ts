import type { Plugin } from "./plugin.js";

const COMPONENT_TAG = "mermaid-diagram";

export function hasMermaidCode(markdown: string): boolean {
  return /(?:^|\n) {0,3}(?:`{3,}|~{3,})[ \t]*mermaid(?:[ \t]+[^\r\n]*)?[ \t]*\r?\n/i.test(markdown);
}

export function processMermaidHtml(html: string): string {
  return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_, code) => {
    // Keep the source escaped until the browser reads it as textContent.
    return `<div class="mermaid-container"><${COMPONENT_TAG}><pre class="mermaid-source">${code}</pre></${COMPONENT_TAG}></div>`;
  });
}

export const mermaidPlugin: Plugin = {
  name: "mermaid",
  markdownProcessors: [{
    name: "mermaid-postprocess",
    postProcess: processMermaidHtml,
  }],
  clientScripts: [{
    key: "mermaid-diagram",
    fileName: "mermaid-diagram",
    sourcePath: "js/mermaid-diagram.js",
    transform: (source, assets) => {
      const src = assets.scripts["mermaid-runtime"];
      if (!src) throw new Error("Mermaid runtime asset is not available");
      const placeholder = JSON.stringify("__MERMAID_RUNTIME__");
      if (!source.includes(placeholder)) throw new Error("Mermaid runtime placeholder is missing");
      return source.replaceAll(placeholder, JSON.stringify(src));
    },
  }],
  webComponents: [{
    tagName: COMPONENT_TAG,
    scriptKey: "mermaid-diagram",
  }],
};

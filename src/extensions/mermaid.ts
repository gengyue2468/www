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
  markdownProcessors: [
    {
      name: "mermaid-postprocess",
      postProcess: processMermaidHtml,
    },
  ],
  clientScripts: [{
    key: "mermaid-diagram",
    fileName: "mermaid-diagram",
    source: assets => mermaidScript(assets.scripts["mermaid-runtime"]),
  }],
  webComponents: [{
    tagName: COMPONENT_TAG,
    scriptKey: "mermaid-diagram",
  }],
};

export function mermaidScript(src: string | undefined): string {
  if (!src) throw new Error("Mermaid runtime asset is not available");

  const runtimeSrc = JSON.stringify(src);
  return `(() => {
  const tagName = ${JSON.stringify(COMPONENT_TAG)};
  if (customElements.get(tagName)) return;

  const darkMedia = window.matchMedia?.("(prefers-color-scheme: dark)");
  const diagrams = new Set();
  const loading = new WeakMap();
  let mermaidPromise;
  let renderId = 0;

  const getThemeConfig = (dark) => ({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      primaryColor: dark ? "#151515" : "#fffff8",
      primaryTextColor: dark ? "#ddd" : "#111",
      primaryBorderColor: dark ? "oklch(26.9% 0 0)" : "rgba(0, 0, 0, 0.15)",
      lineColor: dark ? "#999" : "#333",
      secondaryColor: dark ? "#1a1a1a" : "#f5f5f5",
      tertiaryColor: dark ? "#1f1f1f" : "#e8e8e8",
      background: "transparent",
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      fontSize: "16px",
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: "basis",
      padding: 20,
      nodeSpacing: 70,
      rankSpacing: 70,
      wrap: true,
    },
  });

  const loadMermaid = () => {
    if (!mermaidPromise) {
      mermaidPromise = import(${runtimeSrc}).then(module => module.default || module);
    }
    return mermaidPromise;
  };

  const render = async (element) => {
    const source = element.querySelector(".mermaid-source");
    if (!source || loading.has(element)) return;

    const code = (source.textContent || "").trim();
    if (!code) return;

    const promise = loadMermaid().then(async mermaid => {
      mermaid.initialize(getThemeConfig(!!darkMedia?.matches));
      await mermaid.parse(code);
      const { svg } = await mermaid.render("mermaid-" + (++renderId), code);
      if (!element.isConnected) return;

      const output = element.querySelector(".mermaid-output") || document.createElement("div");
      output.className = "mermaid-output";
      output.setAttribute("role", "img");
      output.setAttribute("aria-label", "Mermaid diagram");
      output.innerHTML = svg;
      element.append(output);
      source.hidden = true;
      element.dataset.state = "rendered";
    }).catch(error => {
      if (!element.isConnected) return;
      element.dataset.state = "error";
      const message = error instanceof Error ? error.message : String(error);
      const errorBox = document.createElement("p");
      errorBox.className = "mermaid-error";
      errorBox.textContent = "Diagram could not be rendered: " + message;
      element.append(errorBox);
      console.error("Mermaid rendering error:", error);
    });

    loading.set(element, promise);
    await promise;
  };

  class MermaidDiagram extends HTMLElement {
    connectedCallback() {
      if (this.observer) return;
      diagrams.add(this);

      if ("IntersectionObserver" in window) {
        this.observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            this.observer.disconnect();
            this.observer = null;
            render(this);
          }
        }, { rootMargin: "600px 0px" });
        this.observer.observe(this);
      } else {
        render(this);
      }
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      this.observer = null;
      diagrams.delete(this);
    }
  }

  customElements.define(tagName, MermaidDiagram);

  darkMedia?.addEventListener("change", () => {
    for (const diagram of diagrams) {
      if (diagram.dataset.state === "rendered") {
        loading.delete(diagram);
        render(diagram);
      }
    }
  });
})();`;
}

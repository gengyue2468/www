import type { Plugin } from "./plugin.js";

export function hasMermaidCode(markdown: string): boolean {
  return /(?:^|\n) {0,3}(?:`{3,}|~{3,})[ \t]*mermaid(?:[ \t]+[^\r\n]*)?[ \t]*\r?\n/i.test(markdown);
}

export function processMermaidHtml(html: string): string {
  return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_, code) => {
    // Keep the source escaped until the browser reads it as textContent.
    return `<pre class="mermaid" role="img" aria-label="Mermaid diagram">${code}</pre>`;
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
};

export const mermaidScript = `
<script src="/js/mermaid.min.js"></script>
<script>

  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const getThemeConfig = (dark) => ({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      primaryColor: dark ? '#151515' : '#fffff8',
      primaryTextColor: dark ? '#ddd' : '#111',
      primaryBorderColor: dark ? 'oklch(26.9% 0 0)' : 'rgba(0, 0, 0, 0.15)',
      lineColor: dark ? '#999' : '#333',
      secondaryColor: dark ? '#1a1a1a' : '#f5f5f5',
      tertiaryColor: dark ? '#1f1f1f' : '#e8e8e8',
      background: 'transparent',
      fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
      fontSize: '16px',
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis',
      padding: 20,
      nodeSpacing: 70,
      rankSpacing: 70,
      wrap: true,
    },
  });

  mermaid.initialize(getThemeConfig(isDark));

  // Render all mermaid diagrams
  async function renderMermaidDiagrams() {
    const diagrams = document.querySelectorAll('.mermaid');

    for (const el of diagrams) {
      // textContent already decodes the escaped Markdown source once.
      let code = (el.textContent || el.innerText || '').trim();

      // Store for dark mode re-renders
      el.dataset.originalCode = code;

      // Clear and render directly
      el.innerHTML = '';

      try {
        // Validate and parse the diagram first
        await mermaid.parse(code);

        // Generate SVG directly
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        const { svg } = await mermaid.render(id, code);

        // Insert the SVG
        el.innerHTML = svg;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Mermaid rendering error:', message);
        const errorBox = document.createElement('div');
        errorBox.style.cssText = 'padding: 1rem; color: red; border: 1px solid red; border-radius: 4px;';
        errorBox.textContent = 'Diagram error: ' + message;
        el.replaceChildren(errorBox);
      }
    }
  }

  // Initial render
  renderMermaidDiagrams();

  // Dark mode change handler
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
      mermaid.initialize(getThemeConfig(e.matches));

      const diagrams = document.querySelectorAll('.mermaid');
      for (const el of diagrams) {
        const code = el.dataset.originalCode;
        if (code) {
          el.innerHTML = '';
          el.textContent = code;
        }
      }

      renderMermaidDiagrams();
    });
  }
</script>
`;

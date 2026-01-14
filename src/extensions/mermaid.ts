import type { Plugin, MarkdownProcessor } from "./plugin.js";

/**
 * Decode HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

/**
 * Check if markdown contains mermaid code blocks
 */
export function hasMermaidCode(markdown: string): boolean {
  return /```mermaid\r?\n[\s\S]*?```/g.test(markdown);
}

/**
 * Post-process HTML to convert mermaid code blocks to renderable divs
 */
export function processMermaidHtml(html: string): string {
  return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_, code) => {
    // Decode HTML entities in the mermaid code
    const decodedCode = decodeHtmlEntities(code);
    return `<pre class="mermaid">${decodedCode}</pre>`;
  });
}

/**
 * Mermaid plugin for markdown-it
 */
export const mermaidPlugin: Plugin = {
  name: "mermaid",
  markdownProcessors: [
    {
      name: "mermaid-postprocess",
      postProcess: processMermaidHtml,
    },
  ],
};

/**
 * Mermaid script to be injected for client-side rendering
 */
export const mermaidScript = `
<!-- Mermaid.js for client-side diagram rendering -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

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

  // Decode HTML entities
  function decodeHtml(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  // Render all mermaid diagrams
  async function renderMermaidDiagrams() {
    const diagrams = document.querySelectorAll('.mermaid');

    for (const el of diagrams) {
      // Get raw code and decode HTML entities
      let code = el.textContent || el.innerText;
      code = decodeHtml(code.trim());

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
        console.error('Mermaid rendering error:', error.message);
        el.innerHTML = '<div style="padding: 1rem; color: red; border: 1px solid red; border-radius: 4px;">Diagram error: ' + error.message + '</div>';
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

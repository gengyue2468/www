/**
 * Markdown Worker for parallel processing
 * Uses Bun's native worker support
 */

declare const self: Worker;

import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import matter from "gray-matter";
import config from "../config.js";
import type { Note, RenderedContent, FrontMatter } from "../types.js";
import { getMarkdownProcessors } from "../extensions/plugin.js";

// Initialize markdown-it instance
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
});

// Register fold container plugin
md.use(container, "fold", {
  validate: (params: string) => params.trim().match(/^fold\s+(.*)$/),
  render: (tokens: any[], idx: number) => {
    const m = tokens[idx].info.trim().match(/^fold\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      const title = m ? md.utils.escapeHtml(m[1]) : "";
      return `<details><summary>${title}</summary>\n`;
    } else {
      return "</details>\n";
    }
  },
});

// Register fullwidth container plugin
md.use(container, "fullwidth", {
  validate: (params: string) => params.trim().match(/^fullwidth$/i),
  render: (tokens: any[], idx: number) => {
    if (tokens[idx].nesting === 1) {
      return `<div class="fullwidth-content">\n`;
    } else {
      return "</div>\n";
    }
  },
});

// Register embed container plugin
function parseEmbedParams(info: string): { src: string; title: string } | null {
  const trimmed = info.trim().replace(/^embed\s+/i, "").trim();
  const srcMatch = trimmed.match(/src=["']([^"']*)["']/);
  if (!srcMatch) return null;
  const titleMatch = trimmed.match(/title=["']([^"']*)["']/);
  return {
    src: md.utils.escapeHtml(srcMatch[1]),
    title: titleMatch ? md.utils.escapeHtml(titleMatch[1]) : "",
  };
}

md.use(container, "embed", {
  validate: (params: string) => params.trim().match(/^embed\b/i),
  render: (tokens: any[], idx: number) => {
    const info = tokens[idx].info.trim();
    const params = parseEmbedParams(info);
    if (tokens[idx].nesting === 1) {
      if (params) {
        return `<div class="embed-block"><iframe src="${params.src}" title="${params.title}" loading="lazy"></iframe>\n`;
      }
      return `<div class="embed-block">\n`;
    }
    return "</div>\n";
  },
});

// Cached processors array
let cachedProcessors: ReturnType<typeof getMarkdownProcessors> | null = null;

function getProcessors() {
  if (!cachedProcessors) {
    cachedProcessors = getMarkdownProcessors();
  }
  return cachedProcessors;
}

// Find the matching closing bracket, skipping over markdown links and images
function findNoteEnd(text: string, startPos: number): number {
  let i = startPos;
  while (i < text.length) {
    const remaining = text.substring(i);
    // Skip markdown links [text](url) and images ![alt](url)
    const linkMatch = remaining.match(/^\[[^\]]*\]\([^)]*\)/);
    if (linkMatch) {
      i += linkMatch[0].length;
      continue;
    }
    // Found the closing bracket
    if (text[i] === ']') {
      return i;
    }
    i++;
  }
  return -1;
}

// Process note syntax
function processNoteSyntax(markdown: string): { processed: string; notes: Note[] } {
  const notes: Note[] = [];
  let processed = markdown;
  let noteIndex = 0;

  const sidenotePrefix = `<!-- ${config.placeholders.sidenote}_`;
  const marginnotePrefix = `<!-- ${config.placeholders.marginnote}_`;

  // Process sidenotes [^content]
  let sidenoteIndex = 0;
  while (true) {
    const startPos = processed.indexOf('[^', sidenoteIndex);
    if (startPos === -1) break;

    const contentStart = startPos + 2;
    const endPos = findNoteEnd(processed, contentStart);

    if (endPos === -1) {
      sidenoteIndex = startPos + 2;
      continue;
    }

    const content = processed.substring(contentStart, endPos);
    const placeholder = `${sidenotePrefix}${noteIndex} -->`;

    notes.push({
      type: 'sidenote',
      content,
      placeholder,
    });

    processed = processed.substring(0, startPos) + placeholder + processed.substring(endPos + 1);
    sidenoteIndex = startPos + placeholder.length;
    noteIndex++;
  }

  // Process marginnotes [note:content]
  let marginnoteIndex = 0;
  while (true) {
    const startPos = processed.indexOf('[note:', marginnoteIndex);
    if (startPos === -1) break;

    const contentStart = startPos + 6;
    const endPos = findNoteEnd(processed, contentStart);

    if (endPos === -1) {
      marginnoteIndex = startPos + 6;
      continue;
    }

    const content = processed.substring(contentStart, endPos);
    const placeholder = `${marginnotePrefix}${noteIndex} -->`;

    notes.push({
      type: 'marginnote',
      content,
      placeholder,
    });

    processed = processed.substring(0, startPos) + placeholder + processed.substring(endPos + 1);
    marginnoteIndex = startPos + placeholder.length;
    noteIndex++;
  }

  return { processed, notes };
}

// Combined regex transformations for performance
function applyHtmlTransforms(html: string): string {
  // Use array for efficient string building
  const transforms: Array<{ pattern: RegExp; replacement: string | ((match: string, ...groups: string[]) => string)}> = [
    // Image optimization: wrap images with alt text in figure/figcaption
    {
      pattern: /<img\s+([^>]*?)alt="([^"]*)"([^>]*?)>/gi,
      replacement: '<figure><img $1alt="$2"$3><figcaption>$2</figcaption></figure>'
    },
    // Image optimization: add lazy loading and async decoding
    {
      pattern: /<img\s+(?![^>]*\bloading=)([^>]*?)>/gi,
      replacement: '<img loading="lazy" decoding="async" $1>'
    },
    // Link optimization: add rel and target for external links
    {
      pattern: /<a\s+(?![^>]*\brel=)(?![^>]*\btarget=)href="(https?:\/\/[^"]+)">/gi,
      replacement: '<a rel="noopener noreferrer" target="_blank" href="$1">'
    }
  ];

  let result = html;

  // Apply transforms in sequence
  for (const { pattern, replacement } of transforms) {
    result = result.replace(pattern, replacement as string);
  }

  // CDN optimization
  if (config.cdn) {
    result = result.replace(
      /(<img\s+[^>]*src=")(\/static\/|\/images\/|\/img\/|\/assets\/)([^"]+")/gi,
      `$1${config.cdn}$2$3`
    );
    result = result.replace(
      /(<a\s+[^>]*href=")(\/static\/|\/images\/|\/img\/|\/assets\/)([^"]+")/gi,
      `$1${config.cdn}$2$3`
    );
  }

  return result;
}

// Fix invalid HTML: extract <figure> from inside <p> tags
function fixFigureInParagraphs(html: string): string {
  return html.replace(
    /<p>([\s\S]*?)<\/p>/gi,
    (match, inner) => {
      if (!inner.includes('<figure>')) return match;
      const parts = inner.split(/(<figure>[\s\S]*?<\/figure>)/gi);
      const result: string[] = [];
      for (const part of parts) {
        if (part.match(/^<figure>/i)) {
          result.push(part);
        } else if (part.trim()) {
          result.push(`<p>${part}</p>`);
        }
      }
      return result.join('') || match;
    }
  );
}

// Render notes to HTML
function renderNotes(html: string, notes: Note[]): string {
  let result = html;
  const timestamp = Date.now();

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    let renderedContent = md.render(note.content);
    renderedContent = renderedContent.trim().replace(/^<p>(.*)<\/p>$/s, "$1").trim();

    const random = Math.random().toString(36).substring(2, 11);
    const id = `sn-${i}-${timestamp}-${random}`;

    const noteHtml =
      note.type === "sidenote"
        ? `<label for="${id}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${renderedContent}</span>`
        : `<label for="${id}" class="margin-toggle">&#8853;</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${renderedContent}</span>`;

    result = result.replace(note.placeholder, noteHtml);
  }

  return result;
}

// Main render function
export async function renderMarkdownWorker(content: string): Promise<RenderedContent> {
  const { data: frontmatter, content: markdown } = matter(content);

  // Apply markdown processors from plugin system
  const processors = getProcessors();
  let processedMarkdown = markdown;
  for (const processor of processors) {
    if (processor.process) {
      const result = processor.process(processedMarkdown);
      processedMarkdown = result instanceof Promise ? await result : result;
    }
  }

  // Process notes
  const { processed: markdownWithNotes, notes } = processNoteSyntax(processedMarkdown);

  // Render markdown
  let html = md.render(markdownWithNotes);

  // Apply post-processors
  for (const processor of processors) {
    if (processor.postProcess) {
      const result = processor.postProcess(html);
      html = result instanceof Promise ? await result : result;
    }
  }

  // Apply HTML transforms
  html = applyHtmlTransforms(html);

  // Fix figures in paragraphs
  html = fixFigureInParagraphs(html);

  // Render notes
  html = renderNotes(html, notes);

  return { frontmatter: frontmatter as FrontMatter, html };
}

// Worker message handler for Bun's worker support
if (typeof self !== 'undefined') {
  self.onmessage = async (event: MessageEvent) => {
    const { id, content } = event.data;
    try {
      const result = await renderMarkdownWorker(content);
      self.postMessage({ id, result, error: null });
    } catch (error) {
      self.postMessage({ id, result: null, error: String(error) });
    }
  };
}

import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import matter from "gray-matter";
import { readFile } from "fs/promises";
import type { Note, RenderedContent, FrontMatter } from "../types.js";
import config from "../config.js";
import { getMarkdownProcessors, getNoteProcessors } from "../extensions/plugin.js";

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

// Extract note content - finds the last closing bracket on the same line
function extractNoteContent(
  text: string,
  startIndex: number,
  prefix: string
): { content: string; endIndex: number } | null {
  const contentStart = startIndex + prefix.length;
  // Find line end
  const lineEnd = text.indexOf("\n", contentStart);
  const searchEnd = lineEnd === -1 ? text.length : lineEnd;

  // Find the last closing bracket on the same line (before line end)
  const closeIndex = text.lastIndexOf("]", searchEnd);
  if (closeIndex === -1 || closeIndex < contentStart) return null;

  const content = text.substring(contentStart, closeIndex);
  return { content, endIndex: closeIndex + 1 };
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

  // Process sidenotes [^content] - content can contain links/images
  let sidenoteIndex = 0;
  while (true) {
    const startPos = processed.indexOf('[^', sidenoteIndex);
    if (startPos === -1) break;

    const contentStart = startPos + 2; // Skip [^
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

    const contentStart = startPos + 6; // Skip [note:
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

export async function renderMarkdown(filePath: string): Promise<RenderedContent> {
  const content = await readFile(filePath, "utf-8");
  const { data: frontmatter, content: markdown } = matter(content);

  // Apply markdown processors from plugin system
  const processors = getMarkdownProcessors();
  let processedMarkdown = markdown;
  for (const processor of processors) {
    if (processor.process) {
      processedMarkdown = processor.process(processedMarkdown);
    }
  }

  // Process notes
  const { processed: markdownWithNotes, notes } = processNoteSyntax(processedMarkdown);

  // Render markdown
  let html = md.render(markdownWithNotes);

  // Apply post-processors
  for (const processor of processors) {
    if (processor.postProcess) {
      html = processor.postProcess(html);
    }
  }

  // Image optimization: add lazy loading and async decoding
  html = html.replace(
    /<img\s+(?![^>]*\bloading=)([^>]*?)>/gi,
    '<img loading="lazy" decoding="async" $1>'
  );

  // Replace note placeholders with rendered HTML (before link optimization)
  for (const note of notes) {
    let renderedContent = md.render(note.content);
    renderedContent = renderedContent.trim().replace(/^<p>(.*)<\/p>$/s, "$1").trim();

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const id = `sn-${notes.indexOf(note)}-${timestamp}-${random}`;

    const noteHtml =
      note.type === "sidenote"
        ? `<label for="${id}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${renderedContent}</span>`
        : `<label for="${id}" class="margin-toggle">&#8853;</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${renderedContent}</span>`;

    html = html.replace(note.placeholder, noteHtml);
  }

  // Link optimization: add rel and target for external links
  html = html.replace(
    /<a\s+(?![^>]*\brel=)(?![^>]*\btarget=)href="(https?:\/\/[^"]+)">/gi,
    '<a rel="noopener noreferrer" target="_blank" href="$1">'
  );

  return { frontmatter: frontmatter as FrontMatter, html };
}

// Get the markdown-it instance for plugins that need it
export function getMarkdownIt(): MarkdownIt {
  return md;
}

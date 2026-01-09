import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import matter from "gray-matter";
import { readFile } from "fs/promises";
import type { Note, RenderedContent, FrontMatter } from "../types.js";
import config from "../config.js";

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  breaks: config.markdown.breaks,
  linkify: true,
});

// Add fold container plugin
md.use(container, "fold", {
  validate: function (params: string) {
    return params.trim().match(/^fold\s+(.*)$/);
  },
  render: function (tokens: any[], idx: number) {
    const m = tokens[idx].info.trim().match(/^fold\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      const title = m ? md.utils.escapeHtml(m[1]) : "";
      return `<details><summary>${title}</summary>\n`;
    } else {
      return "</details>\n";
    }
  },
});

/**
 * Extract note content with balanced brackets, supporting multiline
 */
function extractNoteContent(
  text: string,
  startIndex: number,
  prefix: string
): { content: string; endIndex: number } | null {
  let i = startIndex + prefix.length;
  let bracketCount = 1;
  const start = i;

  while (i < text.length && bracketCount > 0) {
    if (text[i] === "[") bracketCount++;
    else if (text[i] === "]") bracketCount--;
    i++;
  }

  if (bracketCount === 0) {
    return {
      content: text.substring(start, i - 1),
      endIndex: i,
    };
  }
  return null;
}

/**
 * Process custom note syntax - extract notes and render their markdown content
 * Supports [^content] for sidenotes and [note:content] for marginnotes
 */
export function processNoteSyntax(markdown: string): {
  processed: string;
  notes: Note[];
} {
  const notes: Note[] = [];
  let processed = markdown;
  let noteIndex = 0;

  // Extract sidenote: [^内容] - 带编号的侧边栏注释
  let sidenoteIndex = 0;
  while (true) {
    const matchIndex = processed.indexOf("[^", sidenoteIndex);
    if (matchIndex === -1) break;

    const result = extractNoteContent(processed, matchIndex, "[^");
    if (result) {
      const placeholder = `<!-- ${config.placeholders.sidenote}_${noteIndex} -->`;
      notes.push({
        type: "sidenote",
        content: result.content,
        placeholder: placeholder,
      });
      processed =
        processed.substring(0, matchIndex) +
        placeholder +
        processed.substring(result.endIndex);
      sidenoteIndex = matchIndex + placeholder.length;
      noteIndex++;
    } else {
      sidenoteIndex = matchIndex + 2;
    }
  }

  // Extract marginnote: [note:内容] - 不带编号的侧边栏注释
  let marginnoteIndex = 0;
  while (true) {
    const matchIndex = processed.indexOf("[note:", marginnoteIndex);
    if (matchIndex === -1) break;

    const result = extractNoteContent(processed, matchIndex, "[note:");
    if (result) {
      const placeholder = `<!-- ${config.placeholders.marginnote}_${noteIndex} -->`;
      notes.push({
        type: "marginnote",
        content: result.content,
        placeholder: placeholder,
      });
      processed =
        processed.substring(0, matchIndex) +
        placeholder +
        processed.substring(result.endIndex);
      marginnoteIndex = matchIndex + placeholder.length;
      noteIndex++;
    } else {
      marginnoteIndex = matchIndex + 6;
    }
  }

  return { processed, notes };
}

/**
 * Process custom fold syntax - convert [fold:title]...[/fold] to markdown-it container syntax
 */
export function processFoldSyntax(markdown: string): string {
  let processed = markdown;
  let searchIndex = 0;

  // Find [fold:title]...[/fold] blocks and convert to ::: fold title format
  while (true) {
    const openIndex = processed.indexOf("[fold:", searchIndex);
    if (openIndex === -1) break;

    const titleStart = openIndex + 6;
    const titleEnd = processed.indexOf("]", titleStart);
    if (titleEnd === -1) {
      searchIndex = openIndex + 6;
      continue;
    }

    const title = processed.substring(titleStart, titleEnd).trim();
    const closeIndex = processed.indexOf("[/fold]", titleEnd);
    if (closeIndex === -1) {
      searchIndex = openIndex + 6;
      continue;
    }

    const content = processed.substring(titleEnd + 1, closeIndex).trim();

    // Replace with markdown-it container syntax
    const replacement = `::: fold ${title}\n${content}\n:::`;
    processed =
      processed.substring(0, openIndex) +
      replacement +
      processed.substring(closeIndex + 7);

    searchIndex = openIndex + replacement.length;
  }

  return processed;
}

/**
 * Render markdown file to HTML with frontmatter
 */
export async function renderMarkdown(filePath: string): Promise<RenderedContent> {
  const content = await readFile(filePath, "utf-8");
  const { data: frontmatter, content: markdown } = matter(content);

  // Process custom note syntax - extract notes and get placeholders
  const { processed: processedMarkdown1, notes } = processNoteSyntax(markdown);

  // Process custom fold syntax - convert to markdown-it container format
  const processedMarkdown = processFoldSyntax(processedMarkdown1);

  // Render the main markdown using markdown-it
  let html = md.render(processedMarkdown);

  // Replace placeholders with rendered note HTML
  for (const note of notes) {
    // Render the note content as markdown
    let renderedContent = md.render(note.content);

    // Clean up: remove wrapping <p> tags if content is just an image or single element
    renderedContent = renderedContent.trim();
    // Remove <p> tags that wrap the entire content
    renderedContent = renderedContent.replace(/^<p>(.*)<\/p>$/s, "$1");
    // Remove leading/trailing whitespace
    renderedContent = renderedContent.trim();

    // Generate unique ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const id =
      note.type === "sidenote"
        ? `sn-${notes.indexOf(note)}-${timestamp}-${random}`
        : `mn-${notes.indexOf(note)}-${timestamp}-${random}`;

    // Create note HTML
    let noteHtml = "";
    if (note.type === "sidenote") {
      noteHtml = `<label for="${id}" class="margin-toggle sidenote-number"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${renderedContent}</span>`;
    } else {
      noteHtml = `<label for="${id}" class="margin-toggle">&#8853;</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${renderedContent}</span>`;
    }

    // Replace placeholder
    html = html.replace(note.placeholder, noteHtml);
  }

  return { frontmatter: frontmatter as FrontMatter, html };
}


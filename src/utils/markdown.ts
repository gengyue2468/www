import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import katex from "katex";
import texmath from "markdown-it-texmath";
import matter from "gray-matter";
import type { Note, RenderedContent, FrontMatter } from "../types.js";
import config from "../config.js";
import { getMarkdownProcessors, getNoteProcessors, getContainers, getPluginVersion } from "../extensions/plugin.js";
import type { NoteProcessor } from "../extensions/plugin.js";
import { AppError, ErrorCode } from "./errors.js";
import { getCachedRender, setCachedRender } from "./cache.js";
import { sanitizeHtml } from "./html.js";
import { escapeHtmlAttr, escapeHtmlText, htmlToPlainText } from "./seo.js";

let md: MarkdownIt | null = null;
let cachedProcessors: ReturnType<typeof getMarkdownProcessors> | null = null;
let cachedNoteProcessors: NoteProcessor[] | null = null;
let cachedPluginVersion = -1;

function refreshPluginCaches(): void {
  const version = getPluginVersion();
  if (cachedPluginVersion === version) return;
  md = null;
  cachedProcessors = null;
  cachedNoteProcessors = null;
  cachedPluginVersion = version;
}

const KATEX_OPTIONS = {
  throwOnError: false,
  trust: false,
  output: "htmlAndMathml",
  maxExpand: 1000,
  maxSize: 1000,
  macros: {
    "\\XOR": "\\mathbin{\\oplus}",
    "\\AND": "\\mathbin{\\land}",
    "\\OR": "\\mathbin{\\lor}",
    "\\NOT": "\\lnot",
  },
} as const;

export function getMarkdownIt(): MarkdownIt {
  refreshPluginCaches();
  if (md) return md;
  md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  md.use(texmath, {
    engine: katex,
    delimiters: ["dollars", "brackets"],
    katexOptions: KATEX_OPTIONS,
  });
  md.use(container, "fold", {
    validate: (params: string) => params.trim().match(/^fold\s+(.*)$/),
    render: (tokens: any[], idx: number) => {
      const m = tokens[idx].info.trim().match(/^fold\s+(.*)$/);
      if (tokens[idx].nesting === 1) {
        const title = m ? md!.utils.escapeHtml(m[1]) : "";
        return `<details><summary>${title}</summary>\n`;
      } else {
        return "</details>\n";
      }
    },
  });

  md.use(container, "admonition", {
    validate: (params: string) => params.trim().match(/^(note|tip|warning|danger)(?:\s+(.*))?$/i),
    render: (tokens: any[], idx: number) => {
      const match = tokens[idx].info.trim().match(/^(note|tip|warning|danger)(?:\s+(.*))?$/i);
      if (tokens[idx].nesting === 1) {
        const type = (match?.[1] || "note").toLowerCase();
        const defaultTitles: Record<string, string> = { note: "注", tip: "提示", warning: "注意", danger: "警告" };
        const title = match?.[2]?.trim() || defaultTitles[type];
        return `<aside class="admonition admonition-${type}" role="note"><p class="admonition-title">${md!.utils.escapeHtml(title)}</p>\n`;
      }
      return "</aside>\n";
    },
  });

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

  for (const c of getContainers()) {
    md.use(container, c.type, {
      validate: c.validate,
      render: c.render,
    });
  }

  return md;
}

async function getProcessors() {
  refreshPluginCaches();
  if (!cachedProcessors) {
    cachedProcessors = getMarkdownProcessors();
  }
  return cachedProcessors;
}

async function getNoteProcessorsList(): Promise<NoteProcessor[]> {
  refreshPluginCaches();
  if (!cachedNoteProcessors) {
    cachedNoteProcessors = getNoteProcessors();
  }
  return cachedNoteProcessors;
}

function parseEmbedParams(info: string): { src: string; title: string } | null {
  const trimmed = info.trim().replace(/^embed\s+/i, "").trim();
  const srcMatch = trimmed.match(/src=["']([^"']*)["']/);
  if (!srcMatch) return null;
  const src = srcMatch[1].trim();
  try {
    const parsed = new URL(src, config.site.url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
  } catch {
    return null;
  }
  const titleMatch = trimmed.match(/title=["']([^"']*)["']/);
  return {
    src: getMarkdownIt().utils.escapeHtml(src),
    title: titleMatch ? getMarkdownIt().utils.escapeHtml(titleMatch[1]) : "",
  };
}
function skipFencedCode(text: string, index: number): number | null {
  if (index > 0 && text[index - 1] !== "\n") return null;

  const lineEnd = text.indexOf("\n", index);
  const line = text.slice(index, lineEnd === -1 ? text.length : lineEnd);
  const prefixMatch = line.match(/^(?: {0,3}>[ \t]?)+/);
  const prefix = prefixMatch?.[0] || "";
  const opening = line.slice(prefix.length).match(/^ {0,3}(`{3,}|~{3,})/);
  if (!opening) return null;

  const marker = opening[1][0];
  const markerLength = opening[1].length;
  let cursor = lineEnd === -1 ? text.length : lineEnd + 1;
  const closing = new RegExp(`^ {0,3}${marker}{${markerLength},}\\s*$`);

  while (cursor < text.length) {
    const nextLineEnd = text.indexOf("\n", cursor);
    const nextLine = text.slice(cursor, nextLineEnd === -1 ? text.length : nextLineEnd);
    const comparableLine = nextLine.startsWith(prefix) ? nextLine.slice(prefix.length) : nextLine;
    if (closing.test(comparableLine)) {
      return nextLineEnd === -1 ? text.length : nextLineEnd + 1;
    }
    cursor = nextLineEnd === -1 ? text.length : nextLineEnd + 1;
  }

  return text.length;
}

function skipIndentedCode(text: string, index: number): number | null {
  if (index > 0 && text[index - 1] !== "\n") return null;
  const lineEnd = text.indexOf("\n", index);
  const line = text.slice(index, lineEnd === -1 ? text.length : lineEnd);
  if (!/^(?: {4}|\t)/.test(line)) return null;

  let cursor = lineEnd === -1 ? text.length : lineEnd + 1;
  while (cursor < text.length) {
    const nextLineEnd = text.indexOf("\n", cursor);
    const nextLine = text.slice(cursor, nextLineEnd === -1 ? text.length : nextLineEnd);
    if (nextLine.trim() && !/^(?: {4}|\t)/.test(nextLine)) break;
    cursor = nextLineEnd === -1 ? text.length : nextLineEnd + 1;
  }
  return cursor;
}

function skipCodeSpan(text: string, index: number): number {
  let length = 0;
  while (text[index + length] === "`") length++;
  const closing = text.indexOf("`".repeat(length), index + length);
  return closing === -1 ? text.length : closing + length;
}

function skipHtml(text: string, index: number): number | null {
  if (text.startsWith("<!--", index)) {
    const end = text.indexOf("-->", index + 4);
    return end === -1 ? text.length : end + 3;
  }

  const block = text.slice(index).match(/^<(script|style|pre|textarea)\b[^>]*>/i);
  if (block) {
    const closing = new RegExp(`</${block[1]}\\s*>`, "ig");
    closing.lastIndex = index + block[0].length;
    const match = closing.exec(text);
    return match ? match.index + match[0].length : text.length;
  }

  if (!/^<\/?[A-Za-z!]/.test(text.slice(index))) return null;

  let quote = "";
  for (let cursor = index + 1; cursor < text.length; cursor++) {
    const char = text[cursor];
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === ">") {
      return cursor + 1;
    }
  }

  return text.length;
}

function findClosingBracket(text: string, start: number): number | null {
  let depth = 0;
  for (let cursor = start; cursor < text.length; cursor++) {
    if (text[cursor] === "\\") {
      cursor++;
      continue;
    }
    if (text[cursor] === "[") depth++;
    if (text[cursor] === "]") {
      depth--;
      if (depth === 0) return cursor;
    }
  }
  return null;
}

function skipMarkdownLink(text: string, index: number): number | null {
  if (text[index] !== "[") return null;
  const closingBracket = findClosingBracket(text, index);
  if (closingBracket === null) return null;
  return skipLinkDestination(text, closingBracket);
}

function skipLinkDestination(text: string, closingBracket: number): number | null {
  let cursor = closingBracket + 1;
  while (/\s/.test(text[cursor] || "")) cursor++;
  if (text[cursor] !== "(") return null;

  let depth = 0;
  let quote = "";
  for (; cursor < text.length; cursor++) {
    const char = text[cursor];
    if (char === "\\") {
      cursor++;
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
      if (depth === 0) return cursor + 1;
    }
  }

  return text.length;
}

function findNoteEnd(text: string, startPos: number): number {
  let depth = 1;
  let cursor = startPos;

  while (cursor < text.length) {
    const fencedEnd = skipFencedCode(text, cursor);
    if (fencedEnd !== null) {
      cursor = fencedEnd;
      continue;
    }

    if (text[cursor] === "\\") {
      cursor += 2;
      continue;
    }
    if (text[cursor] === "`") {
      cursor = skipCodeSpan(text, cursor);
      continue;
    }

    if (text[cursor] === "<") {
      const htmlEnd = skipHtml(text, cursor);
      if (htmlEnd !== null) {
        cursor = htmlEnd;
        continue;
      }
    }

    if (text[cursor] === "[") {
      depth++;
      cursor++;
      continue;
    }

    if (text[cursor] === "]") {
      if (depth === 1) return cursor;
      depth--;
      const destinationEnd = skipLinkDestination(text, cursor);
      cursor = destinationEnd ?? cursor + 1;
      continue;
    }

    cursor++;
  }

  return -1;
}

function getNoteStart(text: string, index: number): { type: Note["type"]; contentStart: number } | null {
  if (index > 0 && text[index - 1] === "!") return null;
  if (text.startsWith("[^", index)) return { type: "sidenote", contentStart: index + 2 };
  if (text.startsWith("[note:", index)) return { type: "marginnote", contentStart: index + 6 };
  return null;
}

function processNoteSyntax(markdown: string): { processed: string; notes: Note[] } {
  const notes: Note[] = [];
  const output: string[] = [];
  const sidenotePrefix = `<!-- ${config.placeholders.sidenote}_`;
  const marginnotePrefix = `<!-- ${config.placeholders.marginnote}_`;
  let cursor = 0;
  let noteCounter = 0;

  while (cursor < markdown.length) {
    const fencedEnd = skipFencedCode(markdown, cursor);
    if (fencedEnd !== null) {
      output.push(markdown.slice(cursor, fencedEnd));
      cursor = fencedEnd;
      continue;
    }

    const indentedEnd = skipIndentedCode(markdown, cursor);
    if (indentedEnd !== null) {
      output.push(markdown.slice(cursor, indentedEnd));
      cursor = indentedEnd;
      continue;
    }

    if (markdown[cursor] === "\\") {
      output.push(markdown.slice(cursor, Math.min(cursor + 2, markdown.length)));
      cursor += 2;
      continue;
    }
    if (markdown[cursor] === "`") {
      const codeEnd = skipCodeSpan(markdown, cursor);
      output.push(markdown.slice(cursor, codeEnd));
      cursor = codeEnd;
      continue;
    }

    if (markdown[cursor] === "<") {
      const htmlEnd = skipHtml(markdown, cursor);
      if (htmlEnd !== null) {
        output.push(markdown.slice(cursor, htmlEnd));
        cursor = htmlEnd;
        continue;
      }
    }

    if (markdown[cursor] === "[") {
      const linkEnd = skipMarkdownLink(markdown, cursor);
      if (linkEnd !== null) {
        output.push(markdown.slice(cursor, linkEnd));
        cursor = linkEnd;
        continue;
      }
    }

    const start = getNoteStart(markdown, cursor);
    if (!start) {
      output.push(markdown[cursor]);
      cursor++;
      continue;
    }

    const end = findNoteEnd(markdown, start.contentStart);
    if (end === -1) {
      output.push(markdown[cursor]);
      cursor++;
      continue;
    }

    const afterNote = end + 1;
    if (markdown[afterNote] === "(") {
      output.push(markdown.slice(cursor, afterNote));
      cursor = afterNote;
      continue;
    }

    const content = markdown.slice(start.contentStart, end);
    const prefix = start.type === "sidenote" ? sidenotePrefix : marginnotePrefix;
    const placeholder = `${prefix}${noteCounter} -->`;
    notes.push({ type: start.type, content, placeholder });
    output.push(placeholder);
    cursor = afterNote;
    noteCounter++;
  }

  return { processed: output.join(""), notes };
}

function normalizeMathWhitespace(markdown: string): string {
  const output: string[] = [];
  let cursor = 0;

  while (cursor < markdown.length) {
    const fencedEnd = skipFencedCode(markdown, cursor);
    if (fencedEnd !== null) {
      output.push(markdown.slice(cursor, fencedEnd));
      cursor = fencedEnd;
      continue;
    }

    const indentedEnd = skipIndentedCode(markdown, cursor);
    if (indentedEnd !== null) {
      output.push(markdown.slice(cursor, indentedEnd));
      cursor = indentedEnd;
      continue;
    }

    if (markdown[cursor] === "`") {
      const codeEnd = skipCodeSpan(markdown, cursor);
      output.push(markdown.slice(cursor, codeEnd));
      cursor = codeEnd;
      continue;
    }

    if (markdown[cursor] === "\\") {
      output.push(markdown.slice(cursor, Math.min(cursor + 2, markdown.length)));
      cursor += 2;
      continue;
    }

    if (markdown[cursor] === "<") {
      const htmlEnd = skipHtml(markdown, cursor);
      if (htmlEnd !== null) {
        output.push(markdown.slice(cursor, htmlEnd));
        cursor = htmlEnd;
        continue;
      }
    }

    if (markdown[cursor] === "[") {
      const linkEnd = skipMarkdownLink(markdown, cursor);
      if (linkEnd !== null) {
        output.push(markdown.slice(cursor, linkEnd));
        cursor = linkEnd;
        continue;
      }
    }

    if (markdown[cursor] === "$" && markdown[cursor + 1] !== "$" && markdown[cursor - 1] !== "$") {
      let end = cursor + 1;
      while (end < markdown.length) {
        if (markdown[end] === "\\") {
          end += 2;
          continue;
        }
        if (markdown[end] === "$" && markdown[end + 1] !== "$") break;
        end++;
      }

      if (end < markdown.length) {
        const body = markdown.slice(cursor + 1, end);
        const trimmed = body.trim();
        if (trimmed && trimmed !== body) {
          output.push(`$${trimmed}$`);
          cursor = end + 1;
          continue;
        }
      }
    }

    output.push(markdown[cursor]);
    cursor++;
  }

  return output.join("");
}

async function applyPluginNoteProcessors(markdown: string): Promise<{ processed: string; notes: Note[] }> {
  const processors = await getNoteProcessorsList();
  if (processors.length === 0) return { processed: markdown, notes: [] };

  const notes: Note[] = [];
  let processed = markdown;
  let noteCounter = 0;

  for (const proc of processors) {
    // Clone the pattern without stateful flags so captures work for global regexes.
    const pattern = new RegExp(proc.pattern.source, proc.pattern.flags.replace(/[gy]/g, ""));
    let searchIndex = 0;

    while (true) {
      const match = pattern.exec(processed.substring(searchIndex));
      if (!match) break;
      if (match[0].length === 0) {
        throw new AppError(`Note processor '${proc.name}' matched an empty string`, ErrorCode.PLUGIN_ERROR, {
          processor: proc.name,
        });
      }

      const matchStart = searchIndex + match.index!;
      const content = proc.extractContent(match);
      const noteType = proc.getType(match);
      const placeholder = `<!-- ${proc.prefix}_${noteCounter} -->`;

      notes.push({ type: noteType, content, placeholder });
      processed = processed.substring(0, matchStart) + placeholder + processed.substring(matchStart + match[0].length);
      searchIndex = matchStart + placeholder.length;
      noteCounter++;
    }
  }

  return { processed, notes };
}

function applyHtmlTransforms(html: string): string {
  html = html.replace(
    /<img\s+([^>]*?)alt="([^"]*)"([^>]*?)>/gi,
    (match, before, alt, after) => alt.trim()
      ? `<figure><img ${before}alt="${alt}"${after}><figcaption>${escapeHtmlText(decodeHtmlEntities(alt))}</figcaption></figure>`
      : match
  );

  html = html.replace(
    /<img\s+(?![^>]*\bloading=)([^>]*?)>/gi,
    '<img loading="lazy" decoding="async" $1>'
  );

  return html;
}

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

function headingSlug(text: string): string {
  const normalized = decodeHtmlEntities(htmlToPlainText(text)).normalize("NFKC").trim();
  const slug = normalized
    .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || "section";
}

export function addHeadingAnchors(html: string): string {
  const usedIds = new Set<string>();
  return html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attributes = "", inner) => {
    const baseId = attributes.match(/\bid="([^"]+)"/i)?.[1] || headingSlug(inner);
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    const nextAttributes = /\bid="[^"]*"/i.test(attributes)
      ? attributes.replace(/\bid="[^"]*"/i, `id="${escapeHtmlAttr(id)}"`)
      : `${attributes} id="${escapeHtmlAttr(id)}"`;
    const label = escapeHtmlAttr(decodeHtmlEntities(htmlToPlainText(inner)));
    return `<h${level}${nextAttributes}><a class="heading-anchor" href="#${escapeHtmlAttr(id)}" aria-label="链接到${label}"></a>${inner}</h${level}>`;
  });

}

interface TocNode {
  level: number;
  id: string;
  title: string;
  children: TocNode[];
}

function buildTocTree(entries: Array<Omit<TocNode, "children">>): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const entry of entries) {
    const node: TocNode = { ...entry, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push(node);
  }

  return roots;
}

function renderTocTree(nodes: TocNode[]): string {
  const items = nodes.map(node => {
    const children = node.children.length > 0 ? renderTocTree(node.children) : "";
    return `<li><a href="#${escapeHtmlAttr(node.id)}">${escapeHtmlText(node.title)}</a>${children}</li>`;
  });
  return `<ol>${items.join("")}</ol>`;
}

export function generateTableOfContents(html: string): string {
  const entries: Array<Omit<TocNode, "children">> = [];
  html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_match, level, attributes = "", inner) => {
    const id = attributes.match(/\bid="([^"]+)"/i)?.[1];
    const titleHtml = inner.replace(/<a\s+class="heading-anchor"[^>]*>[\s\S]*?<\/a>/gi, "");
    if (id) entries.push({ level: Number(level), id, title: decodeHtmlEntities(htmlToPlainText(titleHtml)) });
    return _match;
  });
  if (entries.length === 0) return "";
  const tree = buildTocTree(entries);
  return `<details class="table-of-contents" open><summary>本文目录</summary><nav aria-label="本文目录">${renderTocTree(tree)}</nav></details>`;
}

function addImageLoadingAttributes(html: string): string {
  return html.replace(/<img\b([^>]*?)>/gi, (match, attributes) => {
    const additions: string[] = [];
    if (!/\bloading\s*=/i.test(attributes)) additions.push('loading="lazy"');
    if (!/\bdecoding\s*=/i.test(attributes)) additions.push('decoding="async"');
    return additions.length === 0
      ? match
      : `<img ${additions.join(" ")}${attributes}>`;
  });

}

function generateNoteId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

async function renderNoteContent(content: string, filePath: string): Promise<string> {
  const processors = await getProcessors();
  let processed = content;
  for (const processor of processors) {
    if (!processor.process) continue;
    try {
      const result = processor.process(processed);
      processed = result instanceof Promise ? await result : result;
    } catch (err) {
        throw AppError.fromError(err, ErrorCode.RENDER_ERROR, {
          processor: processor.name,
          stage: "note-pre-process",
          path: filePath,
        });
    }
  }

  let rendered = getMarkdownIt().render(normalizeMathWhitespace(processed));
  for (const processor of processors) {
    if (!processor.postProcess) continue;
    try {
      const result = processor.postProcess(rendered);
      rendered = result instanceof Promise ? await result : result;
    } catch (err) {
        throw AppError.fromError(err, ErrorCode.RENDER_ERROR, {
          processor: processor.name,
          stage: "note-post-process",
          path: filePath,
        });
    }
  }
  rendered = addImageLoadingAttributes(sanitizeHtml(rendered));
  return rendered.trim().replace(/^<p>(.*)<\/p>$/s, "$1").trim();
}

interface CollectedNote {
  id: string;
  refId: string;
  type: string;
  content: string;
  renderedContent: string;
}

async function renderNotes(html: string, notes: Note[], filePath: string): Promise<string> {
  const collected: CollectedNote[] = [];
  let builtinIndex = 0;

  for (const note of notes) {
    if (note.type !== "sidenote" && note.type !== "marginnote") continue;

    const renderedContent = await renderNoteContent(note.content, filePath);
    const id = generateNoteId("sn", builtinIndex);
    const markerId = `ref-marker-${builtinIndex}`;
    const noteNumber = builtinIndex + 1;
    const sourceAnchor = `<span class="note-connector-source" data-note-target="${id}-content" aria-hidden="true"></span>`;
    const targetAnchor = `<span class="note-connector-target" aria-hidden="true"></span>`;

    let noteHtml: string;
    if (note.type === "sidenote") {
      noteHtml = `${sourceAnchor}<label for="${id}" aria-controls="${id}-content" aria-label="旁注 ${noteNumber}" class="margin-toggle sidenote-number" id="${markerId}"></label><input type="checkbox" id="${id}" aria-controls="${id}-content" aria-label="展开第 ${noteNumber} 条旁注" class="margin-toggle"/><span id="${id}-content" role="note" class="sidenote">${targetAnchor}${renderedContent}</span>`;
    } else {
      noteHtml = `${sourceAnchor}<label for="${id}" aria-controls="${id}-content" aria-label="边注 ${noteNumber}" class="margin-toggle" id="${markerId}">&#8853;</label><input type="checkbox" id="${id}" aria-controls="${id}-content" aria-label="展开第 ${noteNumber} 条边注" class="margin-toggle"/><span id="${id}-content" role="note" class="marginnote">${targetAnchor}${renderedContent}</span>`;
    }

    html = html.replace(note.placeholder, noteHtml);
    collected.push({ id: `sn-list-${builtinIndex}`, refId: markerId, type: note.type, content: note.content, renderedContent });
    builtinIndex++;
  }

  if (collected.length > 0) {
    const hasSidenotes = collected.some(n => n.type === "sidenote");
    const hasMarginnotes = collected.some(n => n.type === "marginnote");
    const mixed = hasSidenotes && hasMarginnotes;

    let listHtml = `<footer class="notes-list"><h3>Note</h3>`;

    if (mixed) {
      listHtml += `<ol class="mixed-notes-list">`;
      for (const note of collected) {
        const cls = note.type === "marginnote" ? ` class="marginnote-item"` : ` class="sidenote-item"`;
         listHtml += `<li${cls} id="${note.id}">${note.renderedContent} <a href="#${note.refId}" aria-label="返回第 ${collected.indexOf(note) + 1} 条旁注引用">↩</a></li>`;
      }
      listHtml += `</ol>`;
      } else if (hasSidenotes) {
      listHtml += `<ol>`;
      for (const note of collected) {
        listHtml += `<li id="${note.id}">${note.renderedContent} <a href="#${note.refId}" aria-label="返回第 ${collected.indexOf(note) + 1} 条旁注引用">↩</a></li>`;
      }
      listHtml += `</ol>`;
    } else {
      listHtml += `<ul>`;
      for (const note of collected) {
        listHtml += `<li id="${note.id}">${note.renderedContent} <a href="#${note.refId}" aria-label="返回第 ${collected.indexOf(note) + 1} 条旁注引用">↩</a></li>`;
      }
      listHtml += `</ul>`;
    }

    listHtml += `</footer>`;

    const closingTag = html.lastIndexOf("</article>");
    if (closingTag !== -1) {
      html = html.slice(0, closingTag) + listHtml + html.slice(closingTag);
    } else {
      html += listHtml;
    }
  }

  return html;
}

async function renderPluginNotes(html: string, notes: Note[], filePath: string): Promise<string> {
  if (notes.length === 0) return html;

  const processors = await getNoteProcessorsList();
  let pluginIndex = 0;

  for (const note of notes) {
    if (note.type === "sidenote" || note.type === "marginnote") continue;

    const id = generateNoteId("pn", pluginIndex);
    pluginIndex++;

    let rendered = false;
    for (const proc of processors) {
      if (note.placeholder.includes(proc.prefix)) {
        try {
          const noteHtml = proc.render(note.content, id, note.type);
          html = html.replace(note.placeholder, noteHtml);
          rendered = true;
          break;
        } catch (err) {
          throw AppError.fromError(err, ErrorCode.RENDER_ERROR, {
            processor: proc.name,
            stage: "note-render",
            path: filePath,
          });
        }
      }
    }

    if (!rendered) {
      const renderedContent = await renderNoteContent(note.content, filePath);
      const noteHtml = `<label for="${id}" aria-controls="${id}-content" aria-label="展开插件旁注" class="margin-toggle">&#8853;</label><input type="checkbox" id="${id}" aria-controls="${id}-content" aria-label="展开插件旁注" class="margin-toggle"/><span id="${id}-content" role="note" class="marginnote">${renderedContent}</span>`;
      html = html.replace(note.placeholder, noteHtml);
    }
  }

  return html;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/gi, entity => {
    const normalized = entity.toLowerCase();
    if (normalized === "&amp;") return "&";
    if (normalized === "&lt;") return "<";
    if (normalized === "&gt;") return ">";
    if (normalized === "&quot;") return '"';
    return "'";
  });
}

function normalizeFrontMatter(data: Record<string, unknown>, filePath: string): FrontMatter {
  const normalized: Record<string, unknown> = { ...data };

  for (const key of ["title", "excerpt", "summary", "description"]) {
    const value = normalized[key];
    if (value === null || value === undefined) {
      delete normalized[key];
    } else if (typeof value !== "string") {
      throw new AppError(`Front matter field '${key}' must be a string`, ErrorCode.PARSE_ERROR, { path: filePath, field: key });
    }
  }

  for (const key of ["date", "updated"]) {
    const value = normalized[key];
    if (value === null || value === undefined || value === "") {
      delete normalized[key];
      continue;
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        throw new AppError(`Front matter field '${key}' is not a valid date`, ErrorCode.PARSE_ERROR, { path: filePath, field: key });
      }
      normalized[key] = value.toISOString().slice(0, 10);
    } else if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) {
      throw new AppError(`Front matter field '${key}' is not a valid date`, ErrorCode.PARSE_ERROR, { path: filePath, field: key });
    }
  }

  const tags = normalized.tags;
  if (tags === null || tags === undefined || tags === "") {
    delete normalized.tags;
  } else if (!Array.isArray(tags) || tags.some(tag => typeof tag !== "string")) {
    throw new AppError("Front matter field 'tags' must be an array of strings", ErrorCode.PARSE_ERROR, { path: filePath, field: "tags" });
  } else {
    normalized.tags = [...new Set(tags.map(tag => tag.trim()).filter(Boolean))];
  }

  const comment = normalized.comment;
  if (comment === null || comment === undefined) {
    delete normalized.comment;
  } else if (typeof comment !== "boolean") {
    throw new AppError("Front matter field 'comment' must be a boolean", ErrorCode.PARSE_ERROR, { path: filePath, field: "comment" });
  }

  return normalized as FrontMatter;
}

function addLinkOptimization(html: string): string {
  html = html.replace(
    /<a\s+(?![^>]*\brel=)(?![^>]*\btarget=)href="(https?:\/\/[^"]+)">/gi,
    '<a rel="noopener noreferrer" target="_blank" href="$1">'
  );

  if (config.cdn) {
    html = html.replace(
      /(<img\s+[^>]*src=")(\/static\/|\/images\/|\/img\/|\/assets\/)([^"]+")/gi,
      `$1${config.cdn}$2$3`
    );
    html = html.replace(
      /(<a\s+[^>]*href=")(\/static\/|\/images\/|\/img\/|\/assets\/)([^"]+")/gi,
      `$1${config.cdn}$2$3`
    );
  }

  return html;
}

export async function renderMarkdown(filePath: string): Promise<RenderedContent> {
  const cached = await getCachedRender(filePath);
  if (cached) {
    return cached;
  }

  let content: string;
  try {
    const file = Bun.file(filePath);
    content = await file.text();
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { path: filePath });
  }

  const { data, content: markdown } = matter(content);
  const frontmatter = normalizeFrontMatter(data, filePath);

  const processors = await getProcessors();
  let processedMarkdown = markdown;
  for (const processor of processors) {
    if (processor.process) {
      try {
        const result = processor.process(processedMarkdown);
        processedMarkdown = result instanceof Promise ? await result : result;
      } catch (err) {
        throw AppError.fromError(err, ErrorCode.RENDER_ERROR, {
          processor: processor.name,
          stage: "pre-process",
          path: filePath,
        });
      }
    }
  }

  const { processed: markdownWithNotes, notes: builtinNotes } = processNoteSyntax(processedMarkdown);
  const { processed: markdownWithAllNotes, notes: pluginNotes } = await applyPluginNoteProcessors(markdownWithNotes);
  const allNotes = [...builtinNotes, ...pluginNotes];

  let html: string;
  try {
    html = getMarkdownIt().render(normalizeMathWhitespace(markdownWithAllNotes));
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.RENDER_ERROR, {
      stage: "markdown-it",
      path: filePath,
    });
  }

  for (const processor of processors) {
    if (processor.postProcess) {
      try {
        const result = processor.postProcess(html);
        html = result instanceof Promise ? await result : result;
      } catch (err) {
        throw AppError.fromError(err, ErrorCode.RENDER_ERROR, {
          processor: processor.name,
          stage: "post-process",
          path: filePath,
        });
      }
    }
  }

  html = addHeadingAnchors(html);
  html = applyHtmlTransforms(html);
  html = fixFigureInParagraphs(html);
  html = await renderPluginNotes(html, allNotes, filePath);
  html = await renderNotes(html, allNotes, filePath);
  html = sanitizeHtml(addLinkOptimization(html));

  const result = { frontmatter, html };

  await setCachedRender(filePath, result);

  return result;
}

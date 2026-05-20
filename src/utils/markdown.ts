import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import matter from "gray-matter";
import type { Note, RenderedContent, FrontMatter } from "../types.js";
import config from "../config.js";
import { getMarkdownProcessors, getNoteProcessors } from "../extensions/plugin.js";
import type { NoteProcessor } from "../extensions/plugin.js";
import { AppError, ErrorCode } from "./errors.js";
import { getCachedRender, setCachedRender } from "./cache.js";

let md: MarkdownIt | null = null;
let cachedProcessors: ReturnType<typeof getMarkdownProcessors> | null = null;
let cachedNoteProcessors: NoteProcessor[] | null = null;

function getMarkdownIt(): MarkdownIt {
  if (md) return md;

  md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
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

  return md;
}

async function getProcessors() {
  if (!cachedProcessors) {
    cachedProcessors = getMarkdownProcessors();
  }
  return cachedProcessors;
}

async function getNoteProcessorsList(): Promise<NoteProcessor[]> {
  if (!cachedNoteProcessors) {
    cachedNoteProcessors = getNoteProcessors();
  }
  return cachedNoteProcessors;
}

function parseEmbedParams(info: string): { src: string; title: string } | null {
  const trimmed = info.trim().replace(/^embed\s+/i, "").trim();
  const srcMatch = trimmed.match(/src=["']([^"']*)["']/);
  if (!srcMatch) return null;
  const titleMatch = trimmed.match(/title=["']([^"']*)["']/);
  return {
    src: getMarkdownIt().utils.escapeHtml(srcMatch[1]),
    title: titleMatch ? getMarkdownIt().utils.escapeHtml(titleMatch[1]) : "",
  };
}

function findNoteEnd(text: string, startPos: number): number {
  let i = startPos;
  while (i < text.length) {
    const remaining = text.substring(i);
    const linkMatch = remaining.match(/^\[[^\]]*\]\([^)]*\)/);
    if (linkMatch) {
      i += linkMatch[0].length;
      continue;
    }
    if (text[i] === ']') {
      return i;
    }
    i++;
  }
  return -1;
}

function processNoteSyntax(markdown: string): { processed: string; notes: Note[] } {
  const notes: Note[] = [];
  let processed = markdown;
  let noteCounter = 0;

  let sidenoteIndex = 0;
  const sidenotePrefix = `<!-- ${config.placeholders.sidenote}_`;
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
    const placeholder = `${sidenotePrefix}${noteCounter} -->`;

    notes.push({ type: 'sidenote', content, placeholder });
    processed = processed.substring(0, startPos) + placeholder + processed.substring(endPos + 1);
    sidenoteIndex = startPos + placeholder.length;
    noteCounter++;
  }

  let marginnoteIndex = 0;
  const marginnotePrefix = `<!-- ${config.placeholders.marginnote}_`;
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
    const placeholder = `${marginnotePrefix}${noteCounter} -->`;

    notes.push({ type: 'marginnote', content, placeholder });
    processed = processed.substring(0, startPos) + placeholder + processed.substring(endPos + 1);
    marginnoteIndex = startPos + placeholder.length;
    noteCounter++;
  }

  return { processed, notes };
}

async function applyPluginNoteProcessors(markdown: string): Promise<{ processed: string; notes: Note[] }> {
  const processors = await getNoteProcessorsList();
  if (processors.length === 0) return { processed: markdown, notes: [] };

  const notes: Note[] = [];
  let processed = markdown;
  let noteCounter = 0;

  for (const proc of processors) {
    let searchIndex = 0;

    while (true) {
      const match = processed.substring(searchIndex).match(proc.pattern);
      if (!match) break;

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
    '<figure><img $1alt="$2"$3><figcaption>$2</figcaption></figure>'
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

function generateNoteId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

function renderNoteContent(content: string): string {
  let rendered = getMarkdownIt().render(content);
  return rendered.trim().replace(/^<p>(.*)<\/p>$/s, "$1").trim();
}

interface CollectedNote {
  id: string;
  refId: string;
  type: string;
  content: string;
  renderedContent: string;
}

function renderNotes(html: string, notes: Note[]): string {
  const collected: CollectedNote[] = [];

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const renderedContent = renderNoteContent(note.content);
    const id = generateNoteId("sn", i);
    const markerId = `ref-marker-${i}`;

    let noteHtml: string;
    if (note.type === "sidenote") {
      noteHtml = `<label for="${id}" class="margin-toggle sidenote-number" id="${markerId}"></label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="sidenote">${renderedContent}</span>`;
    } else {
      noteHtml = `<label for="${id}" class="margin-toggle" id="${markerId}">&#8853;</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${renderedContent}</span>`;
    }

    html = html.replace(note.placeholder, noteHtml);

    if (note.type === "sidenote" || note.type === "marginnote") {
      collected.push({ id: `sn-list-${i}`, refId: markerId, type: note.type, content: note.content, renderedContent });
    }
  }

  if (collected.length > 0) {
    const hasSidenotes = collected.some(n => n.type === "sidenote");
    const hasMarginnotes = collected.some(n => n.type === "marginnote");
    const mixed = hasSidenotes && hasMarginnotes;

    let listHtml = `<footer class="notes-list"><h3>Notae</h3>`;

    if (mixed) {
      listHtml += `<ol>`;
      for (const note of collected) {
        const cls = note.type === "marginnote" ? ` class="marginnote-item"` : "";
        listHtml += `<li${cls} id="${note.id}">${note.renderedContent} <a href="#${note.refId}">↩</a></li>`;
      }
      listHtml += `</ol>`;
    } else if (hasSidenotes) {
      listHtml += `<ol>`;
      for (const note of collected) {
        listHtml += `<li id="${note.id}">${note.renderedContent} <a href="#${note.refId}">↩</a></li>`;
      }
      listHtml += `</ol>`;
    } else {
      listHtml += `<ul>`;
      for (const note of collected) {
        listHtml += `<li id="${note.id}">${note.renderedContent} <a href="#${note.refId}">↩</a></li>`;
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

async function renderPluginNotes(html: string, notes: Note[]): Promise<string> {
  if (notes.length === 0) return html;

  const processors = await getNoteProcessorsList();

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    if (note.type === "sidenote" || note.type === "marginnote") continue;

    const id = generateNoteId("pn", i);

    let rendered = false;
    for (const proc of processors) {
      if (note.placeholder.includes(proc.prefix)) {
        const noteHtml = proc.render(note.content, id, note.type);
        html = html.replace(note.placeholder, noteHtml);
        rendered = true;
        break;
      }
    }

    if (!rendered) {
      const renderedContent = renderNoteContent(note.content);
      const noteHtml = `<label for="${id}" class="margin-toggle">&#8853;</label><input type="checkbox" id="${id}" class="margin-toggle"/><span class="marginnote">${renderedContent}</span>`;
      html = html.replace(note.placeholder, noteHtml);
    }
  }

  return html;
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

  const { data: frontmatter, content: markdown } = matter(content);

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
    html = getMarkdownIt().render(markdownWithAllNotes);
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

  html = applyHtmlTransforms(html);
  html = fixFigureInParagraphs(html);
  html = renderNotes(html, allNotes);
  html = await renderPluginNotes(html, allNotes);
  html = addLinkOptimization(html);

  const result = { frontmatter: frontmatter as FrontMatter, html };

  await setCachedRender(filePath, result);

  return result;
}

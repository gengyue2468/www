import type { Plugin } from "./plugin.js";
import { getMarkdownIt } from "../utils/markdown.js";
import { sanitizeHtml } from "../utils/html.js";

let tabGroupId = -1;

// ── ANSI SGR → HTML ──────────────────────────────────────────────────────────

const ANSI256_PALETTE = [
  "#000000", "#800000", "#008000", "#808000", "#000080", "#800080", "#008080", "#c0c0c0",
  "#808080", "#ff0000", "#00ff00", "#ffff00", "#0000ff", "#ff00ff", "#00ffff", "#ffffff",
];

const FG: Record<number, string> = Object.fromEntries(
  [...Array(8).keys(), ...Array.from({ length: 8 }, (_, i) => i + 8)]
    .map(index => [index < 8 ? index + 30 : index + 82, ansi256ToHex(index)])
);

const BG: Record<number, string> = Object.fromEntries(
  [...Array(8).keys(), ...Array.from({ length: 8 }, (_, i) => i + 8)]
    .map(index => [index < 8 ? index + 40 : index + 92, ansi256ToHex(index)])
);

function ansi256ToHex(n: number): string {
  n = Math.max(0, Math.min(255, Math.trunc(n)));
  if (n < 16) return ANSI256_PALETTE[n];
  if (n < 232) {
    const i = n - 16;
    const levels = [0, 95, 135, 175, 215, 255];
    const red = levels[Math.floor(i / 36)];
    const green = levels[Math.floor((i % 36) / 6)];
    const blue = levels[i % 6];
    return rgbToHex(red, green, blue);
  }
  const g = (n - 232) * 10 + 8;
  return rgbToHex(g, g, g);
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map(value => value.toString(16).padStart(2, "0")).join("")}`;
}

interface AnsiState {
  fg: string;
  bg: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

function applyCodes(codes: number[], s: AnsiState): void {
  let i = 0;
  while (i < codes.length) {
    const c = Number.isFinite(codes[i]) ? codes[i] : 0;
    if (c === 0) { s.fg = ""; s.bg = ""; s.bold = false; s.italic = false; s.underline = false; }
    else if (c === 1) s.bold = true;
    else if (c === 3) s.italic = true;
    else if (c === 4) s.underline = true;
    else if (c === 22) s.bold = false;
    else if (c === 23) s.italic = false;
    else if (c === 24) s.underline = false;
    else if (c in FG) s.fg = FG[c];
    else if (c === 39) s.fg = "";
    else if (c in BG) s.bg = BG[c];
    else if (c === 49) s.bg = "";
    else if (c === 38 || c === 48) {
      const t = c === 38 ? "fg" : "bg";
      if (codes[i + 1] === 5 && codes[i + 2] !== undefined) {
        s[t] = ansi256ToHex(codes[i + 2]);
        i += 2;
      } else if (codes[i + 1] === 2 && codes[i + 4] !== undefined) {
        s[t] = rgbToHex(
          Math.max(0, Math.min(255, codes[i + 2])),
          Math.max(0, Math.min(255, codes[i + 3])),
          Math.max(0, Math.min(255, codes[i + 4]))
        );
        i += 4;
      }
    }
    i++;
  }
}

function buildStyle(s: AnsiState): string {
  const p: string[] = [];
  if (s.bold) p.push("font-weight:bold");
  if (s.italic) p.push("font-style:italic");
  if (s.underline) p.push("text-decoration:underline");
  if (s.fg) p.push(`color:${s.fg}`);
  if (s.bg) p.push(`background-color:${s.bg}`);
  return p.join(";");
}

interface AnsiCell {
  text: string;
  style: string;
}

interface CsiSequence {
  end: number;
  params: string;
  final: string;
}

function readCsiSequence(raw: string, index: number): CsiSequence | null {
  const start = raw[index] === "\x1b" && raw[index + 1] === "["
    ? index + 2
    : raw[index] === "\x9b"
      ? index + 1
      : -1;
  if (start === -1) return null;

  for (let cursor = start; cursor < raw.length; cursor++) {
    const code = raw.charCodeAt(cursor);
    if (code >= 0x40 && code <= 0x7e) {
      return { end: cursor + 1, params: raw.slice(start, cursor), final: raw[cursor] };
    }
  }
  return null;
}

function sequenceParams(params: string): number[] {
  return params
    .replace(/^[?>]/, "")
    .split(";")
    .map(value => value === "" ? 0 : Number(value))
    .filter(value => Number.isFinite(value));
}

function eraseLine(line: AnsiCell[], cursor: number, mode: number): void {
  if (mode === 2) {
    line.length = 0;
  } else if (mode === 1) {
    for (let index = 0; index <= Math.min(cursor, line.length - 1); index++) {
      line[index] = { text: " ", style: "" };
    }
  } else {
    line.splice(Math.min(cursor, line.length));
  }
}

function clearScreen(lines: AnsiCell[][], lineIndex: number, cursor: number, mode: number): { lineIndex: number; cursor: number } {
  if (mode === 2 || mode === 3) {
    lines.length = 1;
    lines[0].length = 0;
    return { lineIndex: 0, cursor: 0 };
  }

  if (mode === 1) {
    for (let index = 0; index <= lineIndex; index++) {
      if (index === lineIndex) eraseLine(lines[index], cursor, 1);
      else lines[index].length = 0;
    }
  } else {
    eraseLine(lines[lineIndex], cursor, 0);
    lines.splice(lineIndex + 1);
  }
  return { lineIndex, cursor };
}

function applyCsiSequence(
  sequence: CsiSequence,
  state: AnsiState,
  lines: AnsiCell[][],
  lineIndex: number,
  cursor: number
): { lineIndex: number; cursor: number } {
  const params = sequenceParams(sequence.params);
  const first = params[0] ?? 0;

  if (sequence.final === "m") {
    applyCodes(params.length > 0 ? params : [0], state);
    return { lineIndex, cursor };
  }

  if (sequence.final === "K") {
    eraseLine(lines[lineIndex], cursor, first);
  } else if (sequence.final === "J") {
    return clearScreen(lines, lineIndex, cursor, first);
  } else if (sequence.final === "G" || sequence.final === "`") {
    cursor = Math.max(0, first - 1);
  } else if (sequence.final === "C" || sequence.final === "a") {
    cursor += Math.max(1, first);
  } else if (sequence.final === "D") {
    cursor = Math.max(0, cursor - Math.max(1, first));
  } else if (sequence.final === "H" || sequence.final === "f") {
    lineIndex = Math.max(0, first - 1);
    while (lines.length <= lineIndex) lines.push([]);
    cursor = Math.max(0, (params[1] ?? 1) - 1);
  }

  return { lineIndex, cursor };
}

export function parseAnsiToHtml(raw: string): string {
  const state: AnsiState = { fg: "", bg: "", bold: false, italic: false, underline: false };
  const lines: AnsiCell[][] = [[]];
  let lineIndex = 0;
  let cursor = 0;

  const write = (text: string): void => {
    const line = lines[lineIndex];
    while (line.length < cursor) line.push({ text: " ", style: "" });
    line[cursor] = { text, style: buildStyle(state) };
    cursor++;
  };

  for (let index = 0; index < raw.length;) {
    const csi = (raw[index] === "\x1b" && raw[index + 1] === "[") || raw[index] === "\x9b";
    if (csi) {
      const sequence = readCsiSequence(raw, index);
      if (sequence) {
        const result = applyCsiSequence(sequence, state, lines, lineIndex, cursor);
        lineIndex = result.lineIndex;
        cursor = result.cursor;
        index = sequence.end;
        continue;
      }
    }

    if (raw[index] === "\x1b" || raw[index] === "\x9b") {
      if (raw[index] === "\x1b" && raw[index + 1] === "]") {
        index += 2;
        while (index < raw.length && raw[index] !== "\x07" && !(raw[index] === "\x1b" && raw[index + 1] === "\\")) index++;
        index += raw[index] === "\x1b" ? 2 : 1;
      } else {
        index += raw[index] === "\x1b" ? 2 : 1;
      }
      continue;
    }

    const character = raw[index];
    if (character === "\r") {
      if (raw[index + 1] !== "\n") cursor = 0;
      index++;
      continue;
    }
    if (character === "\n") {
      lines.push([]);
      lineIndex++;
      cursor = 0;
      index++;
      continue;
    }
    if (character === "\b") {
      cursor = Math.max(0, cursor - 1);
      index++;
      continue;
    }
    if (character === "\t") {
      const spaces = 8 - (cursor % 8);
      for (let count = 0; count < spaces; count++) write(" ");
      index++;
      continue;
    }
    if (character < " " || character === "\x7f") {
      index++;
      continue;
    }

    write(character);
    index++;
  }

  const segments: Array<{ text: string; style: string }> = [];
  for (const line of lines) {
    for (const cell of line) {
      const previous = segments[segments.length - 1];
      if (previous && previous.style === cell.style) previous.text += cell.text;
      else segments.push({ text: cell.text, style: cell.style });
    }
    segments.push({ text: "\n", style: "" });
  }
  if (segments.length > 0) segments.pop();

  return segments.map(segment =>
    segment.style
      ? `<span style="${segment.style}">${escapeHtml(segment.text)}</span>`
      : escapeHtml(segment.text)
  ).join("");
}

// ── Nodeseek block parser ────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function processNqBlock(raw: string): string {
  const lines = raw.split("\n");
  const tabs: Array<{ title: string; content: string[] }> = [];
  let currentTitle = "";
  let currentContent: string[] = [];
  let inTabs = false;
  let inTabItem = false;
  let inCodeFence = false;

  function flushTab(): void {
    if (currentTitle) {
      tabs.push({ title: currentTitle, content: currentContent });
    }
    currentTitle = "";
    currentContent = [];
    inTabItem = false;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Track code fences to avoid parsing their content
    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      currentContent.push(line);
      continue;
    }

    if (inCodeFence) {
      currentContent.push(line);
      continue;
    }

    if (trimmed === ":::: tabs") {
      inTabs = true;
      continue;
    }

    if (trimmed === "::::") {
      flushTab();
      inTabs = false;
      continue;
    }

    if (inTabs && trimmed.match(/^:::?\s+tab-item\s+(.+)$/)) {
      flushTab();
      inTabItem = true;
      currentTitle = trimmed.replace(/^:::?\s+tab-item\s+/, "");
      continue;
    }

    if (inTabItem && trimmed === ":::") {
      flushTab();
      continue;
    }

    currentContent.push(line);
  }

  flushTab();

  if (tabs.length === 0) {
    return `<div class="nq-container">${escapeHtml(raw)}</div>`;
  }

  tabGroupId++;
  const tabsHtml: string[] = [];
  const contentsHtml: string[] = [];
  tabs.forEach((tab, idx) => {
    const id = `nq-${tabGroupId}-${idx}`;
    const contentId = `${id}-content`;
    const checked = idx === 0 ? " checked" : "";
    const content = renderTabContent(tab.content.join("\n"));
    tabsHtml.push(
      `<input class="tab-input" type="radio" name="nq-${tabGroupId}" id="${id}" data-tab="${idx}"${checked} ` +
      `aria-controls="${contentId}" aria-label="${escapeHtml(tab.title)}">` +
      `<label for="${id}">${escapeHtml(tab.title)}</label>`
    );
    contentsHtml.push(`<div class="tab-content" id="${contentId}" data-tab="${idx}" role="region" aria-label="${escapeHtml(tab.title)}">${content}</div>`);
  });

  return `<div class="tabs"><div class="tab-list" role="radiogroup" aria-label="标签页">${tabsHtml.join("\n")}</div><div class="tab-panels">${contentsHtml.join("\n")}</div></div>`;
}

function renderTabContent(content: string): string {
  const ansiBlocks = new Map<string, string>();
  let ansiIndex = 0;
  const markdown = content.replace(
    /```ansi\n([\s\S]*?)```/g,
    (_, code) => {
      const placeholder = `NQ_ANSI_PLACEHOLDER_${ansiIndex}`;
      ansiBlocks.set(
        String(ansiIndex),
        `<pre class="ansi-block"><code>${parseAnsiToHtml(code)}</code></pre>`
      );
      ansiIndex++;
      return `\n\n${placeholder}\n\n`;
    }
  );

  let rendered = getMarkdownIt().render(markdown);
  for (const [index, block] of ansiBlocks) {
    rendered = rendered.replace(`<p>NQ_ANSI_PLACEHOLDER_${index}</p>`, block);
  }
  return sanitizeHtml(rendered);
}

// ── Pre-process: find ::: nq blocks ──────────────────────────────────────────

function processNqBlocks(markdown: string): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    if (/^:::\s*nq\s*$/.test(lines[i].trim())) {
      // Collect block content until matching :::
      const block: string[] = [];
      i++;
      let inTabs = false;
      while (i < lines.length) {
        const trimmed = lines[i].trim();
        if (trimmed === ":::: tabs") inTabs = true;
        if (trimmed === "::::" && inTabs) inTabs = false;
        if (trimmed === ":::" && !inTabs) {
          i++;
          break;
        }
        block.push(lines[i]);
        i++;
      }
      result.push(processNqBlock(block.join("\n")));
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join("\n");
}

// ── Post-process: fallback for standalone ```ansi blocks ──────────────────────

function processAnsiCodeBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-ansi">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => {
      const decoded = code
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return `<pre class="ansi-block"><code>${parseAnsiToHtml(decoded)}</code></pre>`;
    }
  );
}

// ── Plugin export ─────────────────────────────────────────────────────────────

export const nodeseekPlugin: Plugin = {
  name: "nodeseek",
  markdownProcessors: [
    { name: "nodeseek-nq", process: processNqBlocks },
    { name: "nodeseek-ansi", postProcess: processAnsiCodeBlocks },
  ],
};

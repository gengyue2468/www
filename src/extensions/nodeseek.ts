import type { Plugin } from "./plugin.js";
import MarkdownIt from "markdown-it";

let tabGroupId = -1;

const md = new MarkdownIt({ html: true, breaks: true, linkify: true });

// ── ANSI SGR → HTML ──────────────────────────────────────────────────────────

const FG: Record<number, string> = {
  30: "#000", 31: "#c00", 32: "#0a0", 33: "#c80",
  34: "#00c", 35: "#c0c", 36: "#0cc", 37: "#ccc",
  90: "#666", 91: "#f44", 92: "#4f4", 93: "#ff4",
  94: "#44f", 95: "#f4f", 96: "#4ff", 97: "#fff",
};

const BG: Record<number, string> = {
  40: "#000", 41: "#c00", 42: "#0a0", 43: "#c80",
  44: "#00c", 45: "#c0c", 46: "#0cc", 47: "#ccc",
  100: "#666", 101: "#f44", 102: "#4f4", 103: "#ff4",
  104: "#44f", 105: "#f4f", 106: "#4ff", 107: "#fff",
};

function ansi256ToHex(n: number): string {
  if (n < 16) {
    const p = [
      "#000","#c00","#0a0","#c80","#00c","#c0c","#0cc","#ccc",
      "#666","#f44","#4f4","#ff4","#44f","#f4f","#4ff","#fff",
    ];
    return p[n];
  }
  if (n < 232) {
    const i = n - 16;
    return `rgb(${Math.floor(i/36)*51},${Math.floor((i%36)/6)*51},${(i%6)*51})`;
  }
  const g = (n - 232) * 10 + 8;
  return `rgb(${g},${g},${g})`;
}

interface AnsiState { fg: string; bg: string; bold: boolean; italic: boolean; underline: boolean }

function applyCodes(codes: number[], s: AnsiState): void {
  let i = 0;
  while (i < codes.length) {
    const c = codes[i];
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
      if (codes[i+1] === 5 && codes[i+2] !== undefined) { s[t] = ansi256ToHex(codes[i+2]); i += 2; }
      else if (codes[i+1] === 2 && codes[i+4] !== undefined) { s[t] = `rgb(${codes[i+2]},${codes[i+3]},${codes[i+4]})`; i += 4; }
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

function parseAnsiToHtml(raw: string): string {
  const ANSI = /(?:\x1b)?\[(\d+(?:;\d+)*)m/g;
  const st: AnsiState = { fg: "", bg: "", bold: false, italic: false, underline: false };
  const segs: Array<{ t: string; s: string }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = ANSI.exec(raw)) !== null) {
    const before = raw.slice(last, m.index);
    if (before) segs.push({ t: before, s: buildStyle(st) });
    applyCodes(m[1].split(";").map(Number), st);
    last = ANSI.lastIndex;
  }
  const tail = raw.slice(last);
  if (tail) segs.push({ t: tail, s: buildStyle(st) });

  const merged: typeof segs = [];
  for (const seg of segs) {
    const top = merged[merged.length - 1];
    if (top && top.s === seg.s) top.t += seg.t;
    else merged.push(seg);
  }

  return merged.map(seg =>
    seg.s ? `<span style="${seg.s}">${seg.t}</span>` : seg.t
  ).join("");
}

// ── Nodeseek block parser ────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function processNqBlock(raw: string): string {
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
    const checked = idx === 0 ? " checked" : "";
    const content = renderTabContent(tab.content.join("\n"));
    tabsHtml.push(
      `<input type="radio" name="nq-${tabGroupId}" id="${id}"${checked} hidden>` +
      `<label for="${id}">${escapeHtml(tab.title)}</label>`
    );
    contentsHtml.push(`<div class="tab-content">${content}</div>`);
  });

  return `<div class="tabs"><div class="tab-list">${tabsHtml.join("\n")}</div>\n${contentsHtml.join("\n")}</div>`;
}

function renderTabContent(content: string): string {
  let hasAnsi = false;
  const rendered = content.replace(
    /```ansi\n([\s\S]*?)```/g,
    (_, code) => {
      hasAnsi = true;
      return `<pre class="ansi-block"><code>${parseAnsiToHtml(code)}</code></pre>`;
    }
  );
  if (hasAnsi) {
    // Replace blank lines inside <pre> with <br> to prevent
    // markdown-it from ending the HTML block on empty lines
    return rendered.replace(/<pre class="ansi-block"><code>([\s\S]*?)<\/code><\/pre>/g, (_, inner) => {
      const fixed = inner.replace(/\n\n+/g, "\n<br>\n");
      return `<pre class="ansi-block"><code>${fixed}</code></pre>`;
    });
  }
  return md.render(rendered);
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

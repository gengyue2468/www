type MermaidApi = {
  initialize: (config: unknown) => void;
  run: (opts: { nodes: ArrayLike<HTMLElement>; suppressErrors?: boolean }) => Promise<void>;
};

type ShikiHighlighter = {
  codeToHtml: (code: string, opts: { lang: string; theme: string }) => string;
  loadLanguage: (...langs: any[]) => Promise<void>;
  getLoadedLanguages: () => string[];
};

let mermaidPromise: Promise<MermaidApi> | null = null;
let highlighter: ShikiHighlighter | null = null;

function getMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => mod.default as MermaidApi);
  }
  return mermaidPromise;
}

async function getHighlighter(langs: string[]): Promise<ShikiHighlighter> {
  const { createHighlighter } = await import("shiki");
  if (!highlighter) {
    highlighter = (await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs,
    })) as unknown as ShikiHighlighter;
    return highlighter;
  }
  const loaded = new Set(highlighter.getLoadedLanguages());
  const newLangs = langs.filter((l) => !loaded.has(l));
  if (newLangs.length) {
    await Promise.allSettled(newLangs.map((l) => highlighter!.loadLanguage(l as any)));
  }
  return highlighter;
}

function resolveIsDark(): boolean {
  const cls = document.documentElement.classList;
  if (cls.contains("dark")) return true;
  if (cls.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getMermaidConfig(isDark: boolean) {
  const surface = getCssVar("--color-surface") || (isDark ? "#1f1f1f" : "#ffffff");
  const bg = getCssVar("--color-bg") || (isDark ? "#151515" : "#ffffff");
  const border = getCssVar("--color-border") || (isDark ? "#444" : "#ccc");
  const borderSubtle = getCssVar("--color-border-subtle") || (isDark ? "#333" : "#ddd");
  const text = getCssVar("--color-text") || (isDark ? "#ddd" : "#111");
  const textMuted = getCssVar("--color-text-muted") || (isDark ? "#888" : "#666");

  return {
    startOnLoad: false,
    theme: "base" as const,
    securityLevel: "loose" as const,
    fontFamily: "var(--font-sans)",
    themeVariables: {
      primaryColor: surface,
      primaryTextColor: text,
      primaryBorderColor: border,
      lineColor: textMuted,
      secondaryColor: surface,
      tertiaryColor: surface,
      background: bg,
      textColor: text,
      nodeTextColor: text,
      edgeLabelBackground: bg,
      clusterBkg: surface,
      clusterBorder: borderSubtle,
      titleColor: text,
      labelTextColor: text,
      actorBorder: border,
      actorBkg: surface,
      actorTextColor: text,
      signalColor: textMuted,
      signalTextColor: text,
      entityBorder: border,
      entityBkg: surface,
      entityTextColor: text,
    },
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: "basis" as const,
      padding: 4,
      nodeSpacing: 28,
      rankSpacing: 28,
    },
  };
}

function getShikiTheme(): string {
  return resolveIsDark() ? "github-dark" : "github-light";
}

function detectLang(codeEl: Element): string {
  const cls = codeEl.getAttribute("class") || "";
  const match = cls.match(/language-([A-Za-z0-9_-]+)/);
  return match?.[1]?.toLowerCase() || "text";
}

async function highlightCodeBlocks(): Promise<void> {
  const blocks = Array.from(
    document.querySelectorAll<HTMLElement>("[data-blog-content] pre code"),
  );

  if (!blocks.length) return;

  const pageLangs = [
    ...new Set(
      blocks
        .map(detectLang)
        .filter((l) => l !== "mermaid" && l !== "text" && l !== "plain"),
    ),
  ];

  const hl = await getHighlighter(pageLangs);
  const theme = getShikiTheme();

  for (const codeEl of blocks) {
    const pre = codeEl.parentElement;
    if (!pre || pre.tagName !== "PRE") continue;
    if (pre.hasAttribute("data-code-enhanced")) continue;

    const lang = detectLang(codeEl);
    if (lang === "mermaid") continue;

    const rawCode = codeEl.textContent || "";

    try {
      const html = hl.codeToHtml(rawCode, { lang, theme });
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      const shikiCode = wrapper.querySelector("pre code");
      if (shikiCode) {
        codeEl.innerHTML = shikiCode.innerHTML;
      }
      pre.setAttribute("data-code-enhanced", "true");
    } catch {
      pre.setAttribute("data-code-enhanced", "true");
    }
  }
}

function transformMermaidCodeBlocks(): void {
  const mermaidCodeBlocks = Array.from(
    document.querySelectorAll<HTMLElement>("[data-blog-content] pre code.language-mermaid"),
  );

  mermaidCodeBlocks.forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (!pre || pre.tagName !== "PRE") return;

    const source = codeEl.textContent || "";
    const div = document.createElement("div");
    div.className = "mermaid";
    div.textContent = source;
    div.dataset.mermaidSource = source;
    pre.replaceWith(div);
  });
}

async function renderMermaid(): Promise<void> {
  transformMermaidCodeBlocks();

  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-blog-content] .mermaid:not([data-mermaid-rendered])",
    ),
  );

  if (!nodes.length) return;

  const mermaid = await getMermaid();
  mermaid.initialize(getMermaidConfig(resolveIsDark()));

  await mermaid.run({
    nodes,
    suppressErrors: true,
  });

  nodes.forEach((node) => {
    node.setAttribute("data-mermaid-rendered", "true");
  });
}

async function enhanceBlogContent(): Promise<void> {
  await highlightCodeBlocks();
  await renderMermaid();
}

function resetEnhancements(): void {
  document.querySelectorAll<HTMLElement>("[data-blog-content] pre[data-code-enhanced]").forEach((pre) => {
    pre.removeAttribute("data-code-enhanced");
  });
  document.querySelectorAll<HTMLElement>("[data-blog-content] .mermaid[data-mermaid-rendered]").forEach((node) => {
    const src = node.dataset.mermaidSource;
    if (src) node.textContent = src;
    node.removeAttribute("data-mermaid-rendered");
  });
}

export function mountMermaidRuntime(): void {
  document.addEventListener("astro:page-load", () => {
    enhanceBlogContent().catch(() => {});
  });

  new MutationObserver(() => {
    resetEnhancements();
    enhanceBlogContent().catch(() => {});
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}

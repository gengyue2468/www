import type { RenderedContent, FrontMatter } from "../types.js";

export interface MarkdownProcessor {
  name: string;
  // Run before markdown-it rendering, transforms markdown syntax to HTML-compatible
  process?: (markdown: string) => string | Promise<string>;
  // Run after markdown-it rendering, can transform HTML
  postProcess?: (html: string) => string | Promise<string>;
}

export interface NoteProcessor {
  name: string;
  // Regex pattern to match note syntax like [^content] or [note:content]
  pattern: RegExp;
  // Render the matched note content to HTML
  render: (content: string, id: string, type: string) => string;
}

export interface BuildHooks {
  beforeBuild?: () => Promise<void> | void;
  afterBuild?: () => Promise<void> | void;
  beforeRenderPage?: (route: string, content: RenderedContent) => Promise<RenderedContent> | RenderedContent;
  afterRenderPage?: (route: string, html: string) => Promise<string> | string;
  beforeRenderPost?: (slug: string, content: RenderedContent) => Promise<RenderedContent> | RenderedContent;
  afterRenderPost?: (slug: string, html: string) => Promise<string> | string;
}

export interface Plugin {
  name: string;
  markdownProcessors?: MarkdownProcessor[];
  noteProcessors?: NoteProcessor[];
  hooks?: BuildHooks;
}

const plugins: Plugin[] = [];

// Built-in processors that are always registered
const builtInProcessors: MarkdownProcessor[] = [
  {
    name: "fold",
    process: (markdown: string) =>
      markdown.replace(/\[fold:([^\]]+)\]([\s\S]*?)\[\/fold\]/g, "::: fold $1\n$2\n:::"),
  },
];

export function registerPlugin(plugin: Plugin): void {
  plugins.push(plugin);
  console.log(`✓ Registered plugin: ${plugin.name}`);
}

export function getMarkdownProcessors(): MarkdownProcessor[] {
  return [...builtInProcessors, ...plugins.flatMap(p => p.markdownProcessors || [])];
}

export function getNoteProcessors(): NoteProcessor[] {
  return plugins.flatMap(p => p.noteProcessors || []);
}

export function getBuildHooks(): BuildHooks {
  const hooks: BuildHooks = {};
  for (const plugin of plugins) {
    if (plugin.hooks) {
      Object.assign(hooks, plugin.hooks);
    }
  }
  return hooks;
}

// Get all plugins (for external use)
export function getPlugins(): Plugin[] {
  return [...plugins];
}

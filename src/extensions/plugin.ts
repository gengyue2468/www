import type { RenderedContent, FrontMatter, Note } from "../types.js";

export interface MarkdownProcessor {
  name: string;
  process?: (markdown: string) => string | Promise<string>;
  postProcess?: (html: string) => string | Promise<string>;
}

export interface NoteProcessor {
  name: string;
  pattern: RegExp;
  prefix: string;
  render: (content: string, id: string, type: string) => string;
  extractContent: (match: RegExpMatchArray) => string;
  getType: (match: RegExpMatchArray) => string;
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

export function getComposedHooks(): BuildHooks {
  const allHooks = plugins
    .filter(p => p.hooks)
    .map(p => p.hooks!);

  if (allHooks.length === 0) return {};

  return {
    beforeBuild: async () => {
      for (const hooks of allHooks) {
        if (hooks.beforeBuild) await hooks.beforeBuild();
      }
    },
    afterBuild: async () => {
      for (const hooks of allHooks) {
        if (hooks.afterBuild) await hooks.afterBuild();
      }
    },
    beforeRenderPage: async (route, content) => {
      let result = content;
      for (const hooks of allHooks) {
        if (hooks.beforeRenderPage) {
          const r = hooks.beforeRenderPage(route, result);
          result = r instanceof Promise ? await r : r;
        }
      }
      return result;
    },
    afterRenderPage: async (route, html) => {
      let result = html;
      for (const hooks of allHooks) {
        if (hooks.afterRenderPage) {
          const r = hooks.afterRenderPage(route, result);
          result = r instanceof Promise ? await r : r;
        }
      }
      return result;
    },
    beforeRenderPost: async (slug, content) => {
      let result = content;
      for (const hooks of allHooks) {
        if (hooks.beforeRenderPost) {
          const r = hooks.beforeRenderPost(slug, result);
          result = r instanceof Promise ? await r : r;
        }
      }
      return result;
    },
    afterRenderPost: async (slug, html) => {
      let result = html;
      for (const hooks of allHooks) {
        if (hooks.afterRenderPost) {
          const r = hooks.afterRenderPost(slug, result);
          result = r instanceof Promise ? await r : r;
        }
      }
      return result;
    },
  };
}

export function getPlugins(): Plugin[] {
  return [...plugins];
}

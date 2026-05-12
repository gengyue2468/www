import type { RenderedContent } from "../types.js";

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

type HookFn<A, R> = (arg: A) => R | Promise<R>;

async function invokeSequential<T>(
  fns: Array<HookFn<T, T>>,
  initial: T
): Promise<T> {
  let result = initial;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
}

export function getComposedHooks(): BuildHooks {
  const allHooks = plugins
    .filter(p => p.hooks)
    .map(p => p.hooks!);

  if (allHooks.length === 0) return {};

  const runAll = async (hookName: "beforeBuild" | "afterBuild"): Promise<void> => {
    for (const hooks of allHooks) {
      const hook = hooks[hookName];
      if (hook) {
        await hook();
      }
    }
  };

  return {
    beforeBuild: () => runAll("beforeBuild"),
    afterBuild: () => runAll("afterBuild"),

    beforeRenderPage: async (route, content) => {
      const fns = allHooks
        .filter(h => h.beforeRenderPage)
        .map(h => (c: RenderedContent) => h.beforeRenderPage!(route, c));
      return invokeSequential(fns, content);
    },

    afterRenderPage: async (route, html) => {
      const fns = allHooks
        .filter(h => h.afterRenderPage)
        .map(h => (s: string) => h.afterRenderPage!(route, s));
      return invokeSequential(fns, html);
    },

    beforeRenderPost: async (slug, content) => {
      const fns = allHooks
        .filter(h => h.beforeRenderPost)
        .map(h => (c: RenderedContent) => h.beforeRenderPost!(slug, c));
      return invokeSequential(fns, content);
    },

    afterRenderPost: async (slug, html) => {
      const fns = allHooks
        .filter(h => h.afterRenderPost)
        .map(h => (s: string) => h.afterRenderPost!(slug, s));
      return invokeSequential(fns, html);
    },
  };
}

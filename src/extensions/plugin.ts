import type { AssetManifest, RenderedContent } from "../types.js";
import { AppError, ErrorCode } from "../utils/errors.js";
import { escapeHtmlAttr } from "../utils/seo.js";

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

export interface ClientScriptDefinition {
  key: string;
  fileName: string;
  source?: (assets: AssetManifest) => string | Promise<string>;
  sourcePath?: string;
}

export interface WebComponentDefinition {
  tagName: string;
  scriptKey: string;
}

export interface ContainerConfig {
  type: string;
  validate?: (params: string) => RegExpMatchArray | null;
  render: (tokens: any[], idx: number) => string;
}

export interface Plugin {
  name: string;
  markdownProcessors?: MarkdownProcessor[];
  noteProcessors?: NoteProcessor[];
  containers?: ContainerConfig[];
  clientScripts?: ClientScriptDefinition[];
  webComponents?: WebComponentDefinition[];
  hooks?: BuildHooks;
}

const plugins: Plugin[] = [];
let pluginVersion = 0;

const builtInProcessors: MarkdownProcessor[] = [
  {
    name: "fold",
    process: (markdown: string) =>
      markdown.replace(/\[fold:([^\]]+)\]([\s\S]*?)\[\/fold\]/g, "::: fold $1\n$2\n:::"),
  },
];

export function registerPlugin(plugin: Plugin): void {
  for (const processor of plugin.noteProcessors || []) {
    processor.pattern.lastIndex = 0;
    if (processor.pattern.test("")) {
      processor.pattern.lastIndex = 0;
      throw new AppError(`Note processor '${processor.name}' must not match an empty string`, ErrorCode.PLUGIN_ERROR, {
        processor: processor.name,
      });
    }
    processor.pattern.lastIndex = 0;
  }
  const scriptKeys = new Set<string>();
  for (const script of plugin.clientScripts || []) {
    if (!/^[a-z][a-z0-9-]*$/.test(script.key) || scriptKeys.has(script.key)) {
      throw new AppError(`Invalid or duplicate client script key '${script.key}'`, ErrorCode.PLUGIN_ERROR, {
        plugin: plugin.name,
        key: script.key,
      });
    }
    if (!script.source && !script.sourcePath) {
      throw new AppError(`Client script '${script.key}' needs a source or sourcePath`, ErrorCode.PLUGIN_ERROR, {
        plugin: plugin.name,
        key: script.key,
      });
    }
    scriptKeys.add(script.key);
  }

  const componentTags = new Set<string>();
  for (const component of plugin.webComponents || []) {
    if (!/^[a-z][.\d_a-z-]*-[.\d_a-z-]*$/.test(component.tagName)) {
      throw new AppError(`Invalid custom element name '${component.tagName}'`, ErrorCode.PLUGIN_ERROR, {
        plugin: plugin.name,
        tagName: component.tagName,
      });
    }
    if (plugins.some(existing => existing.webComponents?.some(({ tagName }) => tagName === component.tagName))) {
      throw new AppError(`Custom element '${component.tagName}' is already registered`, ErrorCode.PLUGIN_ERROR, {
        plugin: plugin.name,
        tagName: component.tagName,
      });
    }
    if (componentTags.has(component.tagName)) {
      throw new AppError(`Custom element '${component.tagName}' is duplicated`, ErrorCode.PLUGIN_ERROR, {
        plugin: plugin.name,
        tagName: component.tagName,
      });
    }
    if (!scriptKeys.has(component.scriptKey) && !plugins.some(existing =>
      existing.clientScripts?.some(({ key }) => key === component.scriptKey)
    )) {
      throw new AppError(`Custom element '${component.tagName}' references missing script '${component.scriptKey}'`, ErrorCode.PLUGIN_ERROR, {
        plugin: plugin.name,
        tagName: component.tagName,
        scriptKey: component.scriptKey,
      });
    }
    componentTags.add(component.tagName);
  }
  plugins.push(plugin);
  pluginVersion++;
  console.log(`✓ Registered plugin: ${plugin.name}`);
}

export function getPluginVersion(): number {
  return pluginVersion;
}

export function getMarkdownProcessors(): MarkdownProcessor[] {
  return [...builtInProcessors, ...plugins.flatMap(p => p.markdownProcessors || [])];
}

export function getNoteProcessors(): NoteProcessor[] {
  return plugins.flatMap(p => p.noteProcessors || []);
}

export function getContainers(): ContainerConfig[] {
  return plugins.flatMap(p => p.containers || []);
}

export function getClientScriptDefinitions(): ClientScriptDefinition[] {
  return plugins.flatMap(plugin => plugin.clientScripts || []);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function injectWebComponentScripts(html: string, assets: AssetManifest): string {
  const scriptKeys = new Set(
    plugins
    .flatMap(plugin => plugin.webComponents || [])
    .filter(component => new RegExp(`<${escapeRegExp(component.tagName)}(?=[\\s>/])`, "i").test(html))
    .map(component => component.scriptKey)
  );

  const scripts = [...scriptKeys].map(key => {
    const src = assets.scripts[key];
    if (!src) {
      throw new AppError(`Missing emitted client script '${key}'`, ErrorCode.BUILD_ERROR, { key });
    }
    return `<script type="module" src="${escapeHtmlAttr(src)}"></script>`;
  });

  if (scripts.length === 0) return html;

  const injected = scripts.join("\n");
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd === -1) return `${html}\n${injected}`;
  return `${html.slice(0, bodyEnd)}${injected}\n${html.slice(bodyEnd)}`;
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

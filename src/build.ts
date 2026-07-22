import { join } from "path";
import { stat, rm } from "fs/promises";
import { ensureDir, loadLayout, copyPublicFiles, writeFileContent } from "./utils/fs.js";
import { buildPage, getInlinedCss } from "./builders/page.js";
import { buildCollection, getRequiredLayouts } from "./builders/collection.js";
import { generateRSS } from "./generators/rss.js";
import { generateSitemap } from "./generators/sitemap.js";
import { generateRobotsTxt } from "./generators/robots.js";
import { emitMarkdownFiles, generateLlmsTxt } from "./generators/llms.js";
import { registerPlugin, getComposedHooks } from "./extensions/plugin.js";
import { mermaidPlugin } from "./extensions/mermaid.js";
import { nodeseekPlugin } from "./extensions/nodeseek.js";
import { clearContentCache } from "./utils/cache.js";
import { AppError, ErrorCode, errorReporter, isENOENT } from "./utils/errors.js";
import { cleanBaseUrl } from "./utils/url.js";
import type { CollectionOutput } from "./types.js";
import config from "./config.js";

registerPlugin(mermaidPlugin);
registerPlugin(nodeseekPlugin);

class PerformanceTimer {
  private times = new Map<string, number>();
  private results: Array<{ name: string; duration: number }> = [];

  start(name: string): void {
    this.times.set(name, performance.now());
  }

  end(name: string): number {
    const start = this.times.get(name);
    if (start === undefined) return 0;
    const duration = performance.now() - start;
    this.results.push({ name, duration });
    return duration;
  }

  report(): void {
    console.log("\n📊 Build Performance Report:");
    console.log("─".repeat(50));
    let total = 0;
    for (const { name, duration } of this.results) {
      total += duration;
      console.log(`  ${name.padEnd(30)} ${duration.toFixed(2).padStart(8)}ms`);
    }
    console.log("─".repeat(50));
    console.log(`  ${"TOTAL".padEnd(30)} ${total.toFixed(2).padStart(8)}ms`);
  }

  reset(): void {
    this.times.clear();
    this.results = [];
  }
}

async function buildStaticPages(
  routes: Record<string, string>,
  baseLayout: string,
  pageLayout: string,
  currentYear: number,
  defaultOgImageUrl: string | undefined,
  hooks: ReturnType<typeof getComposedHooks>
): Promise<void> {
  const results = await Promise.allSettled(
    Object.entries(routes).map(async ([route, file]) => {
      const isCollectionRoute = config.collections.some(
        c => route === `/${c.urlPrefix || c.name}`
      );
      if (isCollectionRoute) return;

      const filePath = join(config.dirs.pages, file);
      try {
        await stat(filePath);
        await buildPage(
          route, filePath, baseLayout, pageLayout,
          currentYear, defaultOgImageUrl,
          hooks
        );
        console.log(`✓ Built ${route}`);
      } catch (err) {
        if (isENOENT(err)) {
          console.warn(`⚠ Warning: ${filePath} not found, skipping ${route}`);
        } else {
          throw err;
        }
      }
    })
  );

  for (const result of results) {
    if (result.status === "rejected") {
      errorReporter.report(
        AppError.fromError(result.reason, ErrorCode.BUILD_ERROR, { phase: "static-pages" })
      );
    }
  }
}

async function buildCollections(
  collections: typeof config.collections,
  baseLayout: string,
  layoutsMap: Record<string, string>,
  currentYear: number,
  inlinedCss: string,
  hooks: ReturnType<typeof getComposedHooks>,
  timer: PerformanceTimer
): Promise<CollectionOutput[]> {
  const results = await Promise.allSettled(
    collections.map(async (coll) => {
      timer.start(`collection:${coll.name}`);
      try {
        const output = await buildCollection(
          coll, baseLayout, layoutsMap, currentYear, inlinedCss, hooks
        );
        return output;
      } finally {
        timer.end(`collection:${coll.name}`);
      }
    })
  );

  const outputs: CollectionOutput[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      outputs.push(result.value);
    } else {
      errorReporter.report(
        AppError.fromError(result.reason, ErrorCode.BUILD_ERROR, { phase: "collections" })
      );
    }
  }

  return outputs;
}

async function generateFeeds(
  primaryCollection: CollectionOutput | undefined,
  allCollectionOutputs: CollectionOutput[]
): Promise<void> {
  const feedPromises: Promise<void>[] = [];

  if (config.rss.enabled && primaryCollection) {
    feedPromises.push(generateRSS(primaryCollection));
  }
  if (config.sitemap.enabled) {
    feedPromises.push(generateSitemap(allCollectionOutputs));
  }
  if (config.robots.enabled) {
    feedPromises.push(generateRobotsTxt());
  }

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === "rejected") {
      errorReporter.report(
        AppError.fromError(result.reason, ErrorCode.BUILD_ERROR, { phase: "feeds" })
      );
    }
  }
}

async function generateLlmOutputs(allCollectionOutputs: CollectionOutput[]): Promise<void> {
  if (!config.llms.enabled) return;

  const results = await Promise.allSettled([
    emitMarkdownFiles(allCollectionOutputs),
    generateLlmsTxt(allCollectionOutputs),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      errorReporter.report(
        AppError.fromError(result.reason, ErrorCode.BUILD_ERROR, { phase: "llms" })
      );
    }
  }
}

async function build404Page(
  baseLayout: string,
  pageLayout: string,
  currentYear: number,
  defaultOgImageUrl: string | undefined,
  hooks: ReturnType<typeof getComposedHooks>
): Promise<void> {
  const filePath404 = join(config.dirs.pages, "404.md");
  try {
    await stat(filePath404);
    await buildPage(
      "/404", filePath404, baseLayout, pageLayout,
      currentYear, defaultOgImageUrl,
      hooks,
      '<meta name="robots" content="noindex, nofollow" />'
    );

    const dist404DirPath = join(config.dirs.dist, "404", "index.html");
    const dist404Path = join(config.dirs.dist, "404.html");
    try {
      const file404 = Bun.file(dist404DirPath);
      const content = await file404.text();
      await writeFileContent(dist404Path, content);
      await rm(join(config.dirs.dist, "404"), { recursive: true, force: true });
    } catch (err) {
      console.warn(`⚠ Failed to copy 404 page:`, (err as Error).message);
    }
    console.log("✓ Built /404");
  } catch (err) {
    if (!isENOENT(err)) {
      throw err;
    }
  }
}

async function downloadMermaidJS(destPath: string): Promise<void> {
  if (await Bun.file(destPath).exists()) return;
  const url = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  try {
    console.log("  Downloading mermaid.js...");
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    await Bun.write(destPath, resp);
    console.log("  ✓ mermaid.js downloaded");
  } catch (err) {
    console.warn(`  ⚠ Failed to download mermaid.js: ${(err as Error).message}`);
  }
}

const timer = new PerformanceTimer();

export async function build(): Promise<void> {
  console.log("📦 Building site...\n");
  errorReporter.reset();
  timer.reset();
  timer.start("total");

  timer.start("setup");
  await ensureDir(config.dirs.dist);
  await downloadMermaidJS(join(config.dirs.dist, "js", "mermaid.min.js"));

  clearContentCache();

  const hooks = getComposedHooks();

  const collectionLayouts = getRequiredLayouts(config.collections);
  const allLayoutNames = ["base", "page", ...collectionLayouts];
  const layoutEntries = await Promise.all(
    allLayoutNames.map(async (name) => {
      const content = await loadLayout(name, config.dirs.layouts);
      return [name, content] as const;
    })
  );
  const layoutsMap = Object.fromEntries(layoutEntries);

  const baseLayout = layoutsMap["base"];
  const pageLayout = layoutsMap["page"];

  const currentYear = new Date().getFullYear();
  const inlinedCss = await getInlinedCss();
  timer.end("setup");

  const defaultOgImageUrl = config.site.ogImage
    ? cleanBaseUrl(config.cdn || config.site.url) + config.site.ogImage
    : undefined;

  if (hooks.beforeBuild) {
    await hooks.beforeBuild();
  }

  timer.start("static-pages");
  await buildStaticPages(config.routes, baseLayout, pageLayout, currentYear, defaultOgImageUrl, hooks);
  timer.end("static-pages");

  timer.start("collections");
  const allCollectionOutputs = await buildCollections(
    config.collections, baseLayout, layoutsMap, currentYear, inlinedCss, hooks, timer
  );
  timer.end("collections");

  const primaryCollection = allCollectionOutputs[0];

  timer.start("feeds");
  await generateFeeds(primaryCollection, allCollectionOutputs);
  timer.end("feeds");

  timer.start("llms");
  await generateLlmOutputs(allCollectionOutputs);
  timer.end("llms");

  timer.start("404-page");
  await build404Page(baseLayout, pageLayout, currentYear, defaultOgImageUrl, hooks);
  timer.end("404-page");

  timer.start("copy-public");
  await copyPublicFiles(config.dirs);
  timer.end("copy-public");

  if (hooks.afterBuild) {
    await hooks.afterBuild();
  }

  timer.end("total");
  timer.report();

  const { errors, warnings } = errorReporter.summary();
  if (errors > 0) {
    console.log(`\n✗ Build completed with ${errors} error(s) and ${warnings} warning(s)`);
  } else if (warnings > 0) {
    console.log(`\n✓ Build complete with ${warnings} warning(s)!`);
  } else {
    console.log("\n✓ Build complete!");
  }
}

import { join, dirname } from "path";
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
import { createCacheManager, clearContentCache } from "./utils/cache.js";
import type { BuildCacheManager } from "./utils/cache.js";
import type { CollectionOutput } from "./types.js";
import config from "./config.js";

registerPlugin(mermaidPlugin);

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
}

async function checkLayoutsChanged(
  cacheManager: BuildCacheManager,
  layoutsDir: string,
  extraLayouts: string[] = []
): Promise<boolean> {
  const base = ["base", "page"];
  const all = [...base, ...extraLayouts];
  for (const name of all) {
    const layoutPath = join(layoutsDir, `${name}.html`);
    if (await cacheManager.hasLayoutChanged(name, layoutPath)) {
      return true;
    }
  }
  return false;
}

async function updateLayoutMtimes(
  cacheManager: BuildCacheManager,
  layoutsDir: string,
  extraLayouts: string[] = []
): Promise<void> {
  const base = ["base", "page"];
  const all = [...base, ...extraLayouts];
  for (const name of all) {
    const layoutPath = join(layoutsDir, `${name}.html`);
    await cacheManager.updateLayoutMtime(name, layoutPath);
  }
}

const timer = new PerformanceTimer();

async function build(): Promise<void> {
  console.log("📦 Building site...\n");
  timer.start("total");

  timer.start("setup");
  await ensureDir(config.dirs.dist);

  const cacheManager = await createCacheManager(config.dirs);
  const hooks = getComposedHooks();

  const configPath = join(import.meta.dir, "config.ts");
  if (await cacheManager.hasConfigChanged(configPath)) {
    console.log("  Config changed, invalidating cache");
    cacheManager.invalidateAll();
    clearContentCache();
  }

  // Determine all layout names needed
  const collectionLayouts = getRequiredLayouts(config.collections);
  const layoutsChanged = await checkLayoutsChanged(cacheManager, config.dirs.layouts, collectionLayouts);
  if (layoutsChanged) {
    console.log("  Layout changed, clearing render cache");
    cacheManager.invalidateAll();
    clearContentCache();
  }

  if (hooks.beforeBuild) {
    await hooks.beforeBuild();
  }

  // Load all layouts in parallel
  const allLayoutNames = ["base", "page", ...collectionLayouts];
  const layoutEntries = await Promise.all(
    allLayoutNames.map(async (name) => {
      const path = join(config.dirs.layouts, `${name}.html`);
      const content = await loadLayout(name, config.dirs.layouts);
      return [name, content] as const;
    })
  );
  const layoutsMap = Object.fromEntries(layoutEntries);

  await updateLayoutMtimes(cacheManager, config.dirs.layouts, collectionLayouts);
  await cacheManager.updateConfigMtime(configPath);

  const baseLayout = layoutsMap["base"];
  const pageLayout = layoutsMap["page"];

  const currentYear = new Date().getFullYear();
  const inlinedCss = await getInlinedCss();
  timer.end("setup");

  const defaultOgImageUrl = config.site.ogImage
    ? (config.cdn || config.site.url).replace(/\/$/, "") + config.site.ogImage
    : undefined;

  // Build static pages
  timer.start("static-pages");
  const staticPageResults = await Promise.allSettled(
    Object.entries(config.routes).map(async ([route, file]) => {
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
          cacheManager, hooks
        );
        console.log(`✓ Built ${route}`);
      } catch (err) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === "ENOENT") {
          console.warn(`⚠ Warning: ${filePath} not found, skipping ${route}`);
        } else {
          throw err;
        }
      }
    })
  );
  const pageErrors = staticPageResults.filter(r => r.status === "rejected");
  if (pageErrors.length > 0) {
    for (const e of pageErrors) console.error("Page build error:", (e as PromiseRejectedResult).reason);
  }
  timer.end("static-pages");

  // Build all collections
  const allCollectionOutputs: CollectionOutput[] = [];

  for (const coll of config.collections) {
    timer.start(`collection:${coll.name}`);
    const output = await buildCollection(
      coll,
      baseLayout,
      layoutsMap,
      currentYear,
      inlinedCss,
      cacheManager,
      hooks
    );
    allCollectionOutputs.push(output);
    timer.end(`collection:${coll.name}`);
  }

  // Use first collection (blog) as the primary feed source
  const primaryCollection = allCollectionOutputs[0];

  // Generate feeds in parallel
  timer.start("feeds");
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

  const feedResults = await Promise.allSettled(feedPromises);
  const feedErrors = feedResults.filter(r => r.status === "rejected");
  if (feedErrors.length > 0) {
    for (const e of feedErrors) console.error("Feed generation error:", (e as PromiseRejectedResult).reason);
  }
  timer.end("feeds");

  // LLM-friendly outputs
  if (config.llms.enabled) {
    timer.start("llms");
    const llmsResults = await Promise.allSettled([
      emitMarkdownFiles(allCollectionOutputs),
      generateLlmsTxt(allCollectionOutputs),
    ]);
    const llmsErrors = llmsResults.filter(r => r.status === "rejected");
    if (llmsErrors.length > 0) {
      for (const e of llmsErrors) console.error("LLM output error:", (e as PromiseRejectedResult).reason);
    }
    timer.end("llms");
  }

  // Build 404 page
  timer.start("404-page");
  const filePath404 = join(config.dirs.pages, "404.md");
  try {
    await stat(filePath404);
    await buildPage(
      "/404", filePath404, baseLayout, pageLayout,
      currentYear, defaultOgImageUrl,
      cacheManager, hooks,
      '<meta name="robots" content="noindex, nofollow" />'
    );

    const dist404DirPath = join(config.dirs.dist, "404", "index.html");
    const dist404Path = join(config.dirs.dist, "404.html");
    try {
      const file404 = Bun.file(dist404DirPath);
      const content = await file404.text();
      await writeFileContent(dist404Path, content);
      await rm(join(config.dirs.dist, "404"), { recursive: true, force: true });
    } catch { /* ignore */ }
    console.log("✓ Built /404");
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") {
      throw err;
    }
  }
  timer.end("404-page");

  // Copy public files
  timer.start("copy-public");
  await copyPublicFiles(config.dirs);
  timer.end("copy-public");

  cacheManager.save();

  if (hooks.afterBuild) {
    await hooks.afterBuild();
  }

  timer.end("total");
  timer.report();

  console.log("\n✓ Build complete!");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});

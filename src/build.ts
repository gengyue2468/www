import { join, dirname, relative } from "path";
import { mkdir, rm, readdir, rename, stat } from "fs/promises";
import { ensureDir, loadLayout, copyPublicFiles, copyDirectory, writeFileContent } from "./utils/fs.js";
import { buildPage, getInlinedCss } from "./builders/page.js";
import { buildCollection, getRequiredLayouts } from "./builders/collection.js";
import { generateRSS } from "./generators/rss.js";
import { generateSitemap } from "./generators/sitemap.js";
import { generateRobotsTxt } from "./generators/robots.js";
import { emitMarkdownFiles, generateLlmsTxt } from "./generators/llms.js";
import { registerPlugin, getComposedHooks } from "./extensions/plugin.js";
import { mermaidPlugin, hasMermaidCode } from "./extensions/mermaid.js";
import { nodeseekPlugin } from "./extensions/nodeseek.js";
import { AppError, ErrorCode, errorReporter, isENOENT } from "./utils/errors.js";
import { cleanBaseUrl } from "./utils/url.js";
import { auditDist, type HtmlAuditIssueKind } from "./utils/html-audit.js";
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
    let measuredTotal: number | undefined;
    for (const { name, duration } of this.results) {
      if (name === "total") measuredTotal = duration;
      else total += duration;
      console.log(`  ${name.padEnd(30)} ${duration.toFixed(2).padStart(8)}ms`);
    }
    console.log("─".repeat(50));
    console.log(`  ${"TOTAL".padEnd(30)} ${(measuredTotal ?? total).toFixed(2).padStart(8)}ms`);
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
          throw new AppError(`Route source not found: ${filePath}`, ErrorCode.FILE_NOT_FOUND, { route, filePath });
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

  try {
    await emitMarkdownFiles(allCollectionOutputs);
    await generateLlmsTxt(allCollectionOutputs);
  } catch (err) {
    errorReporter.report(
      AppError.fromError(err, ErrorCode.BUILD_ERROR, { phase: "llms" })
    );
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
  if (!(await Bun.file(filePath404).exists())) {
    throw new AppError(`Required 404 page not found: ${filePath404}`, ErrorCode.FILE_NOT_FOUND, {
      path: filePath404,
    });
  }

  await buildPage(
    "/404", filePath404, baseLayout, pageLayout,
    currentYear, defaultOgImageUrl,
    hooks,
    '<meta name="robots" content="noindex, nofollow" />'
  );

  const dist404DirPath = join(config.dirs.dist, "404", "index.html");
  const dist404Path = join(config.dirs.dist, "404.html");
  const file404 = Bun.file(dist404DirPath);
  if (!(await file404.exists())) {
    throw new AppError(`404 page output not found: ${dist404DirPath}`, ErrorCode.FILE_WRITE_ERROR, {
      path: dist404DirPath,
    });
  }
  const content = await file404.text();
  await writeFileContent(dist404Path, content);
  await rm(join(config.dirs.dist, "404"), { recursive: true, force: true });
  console.log("✓ Built /404");
}

const MERMAID_VERSION = "10.9.3";
const MERMAID_CACHE_DIR = join(config.rootDir, ".build-cache");
const BUILD_LOCK_DIR = join(config.rootDir, ".build-lock");

async function downloadMermaidJS(destPath: string): Promise<void> {
  if (await Bun.file(destPath).exists()) return;
  await ensureDir(dirname(destPath));
  const cachePath = join(MERMAID_CACHE_DIR, `mermaid-${MERMAID_VERSION}.min.js`);
  if (await Bun.file(cachePath).exists() && (await Bun.file(cachePath).size) > 0) {
    await Bun.write(destPath, Bun.file(cachePath));
    return;
  }

  const url = `https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.min.js`;
  const temporaryPath = `${cachePath}.tmp-${process.pid}-${Date.now()}`;
  try {
    console.log("  Downloading mermaid.js...");
    await ensureDir(MERMAID_CACHE_DIR);
    const resp = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    await Bun.write(temporaryPath, resp);
    await rename(temporaryPath, cachePath);
    await Bun.write(destPath, Bun.file(cachePath));
    console.log("  ✓ mermaid.js downloaded");
  } catch (err) {
    await rm(temporaryPath, { force: true });
    throw AppError.fromError(err, ErrorCode.FILE_WRITE_ERROR, { url, destPath });
  }
}

async function directoryContainsPattern(dir: string, pattern: RegExp): Promise<boolean> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (isENOENT(err)) return false;
    throw err;
  }

  for (const entry of entries) {
    const filePath = join(dir, entry.name);
    if (entry.isDirectory() && await directoryContainsPattern(filePath, pattern)) return true;
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    if (pattern.test(await Bun.file(filePath).text())) return true;
    pattern.lastIndex = 0;
  }

  return false;
}

async function hasMermaidSource(): Promise<boolean> {
  const files = Object.values(config.routes).map(file => join(config.dirs.pages, file));
  for (const filePath of files) {
    try {
      if (await Bun.file(filePath).exists() && hasMermaidCode(await Bun.file(filePath).text())) return true;
    } catch {
      // Static route validation reports missing files separately.
    }
  }

  for (const collection of config.collections) {
    if (await directoryContainsPattern(collection.srcDir || join(config.rootDir, "content", collection.name), /(?:^|\n) {0,3}(?:`{3,}|~{3,})[ \t]*mermaid(?:[ \t]+[^\r\n]*)?[ \t]*\r?\n/i)) return true;
  }
  return false;
}

async function requireDirectory(directory: string, label: string): Promise<void> {
  try {
    await readdir(directory);
  } catch (err) {
    throw new AppError(`Required ${label} directory not found: ${directory}`, ErrorCode.FILE_NOT_FOUND, {
      directory,
      cause: String(err),
    });
  }
}

async function validateBuildInputs(): Promise<void> {
  await requireDirectory(config.dirs.pages, "pages");
  await requireDirectory(config.dirs.public, "public");
  await requireDirectory(config.dirs.layouts, "layouts");

  for (const [route, file] of Object.entries(config.routes)) {
    const filePath = join(config.dirs.pages, file);
    if (!(await Bun.file(filePath).exists())) {
      throw new AppError(`Route source not found: ${filePath}`, ErrorCode.FILE_NOT_FOUND, { route, filePath });
    }
  }

  const requiredLayouts = ["base", "page", ...getRequiredLayouts(config.collections)];
  for (const layout of new Set(requiredLayouts)) {
    const layoutPath = join(config.dirs.layouts, `${layout}.html`);
    if (!(await Bun.file(layoutPath).exists())) {
      throw new AppError(`Required layout not found: ${layoutPath}`, ErrorCode.FILE_NOT_FOUND, { layout, layoutPath });
    }
  }

  for (const cssFile of ["tufte.css", "globals.css"]) {
    const cssPath = join(config.dirs.public, cssFile);
    if (!(await Bun.file(cssPath).exists())) {
      throw new AppError(`Required stylesheet not found: ${cssPath}`, ErrorCode.FILE_NOT_FOUND, { cssPath });
    }
  }

  const notFoundPath = join(config.dirs.pages, "404.md");
  if (!(await Bun.file(notFoundPath).exists())) {
    throw new AppError(`Required 404 page not found: ${notFoundPath}`, ErrorCode.FILE_NOT_FOUND, { notFoundPath });
  }

  for (const collection of config.collections) {
    const srcDir = collection.srcDir || join(config.rootDir, "content", collection.name);
    await requireDirectory(srcDir, `collection '${collection.name}'`);
  }

  const katexCss = join(config.rootDir, "node_modules", "katex", "dist", "katex.min.css");
  if (!(await Bun.file(katexCss).exists())) {
    throw new AppError(`KaTeX dependency is not installed: ${katexCss}`, ErrorCode.FILE_NOT_FOUND, { katexCss });
  }
}

async function copyKatexAssets(destDir: string): Promise<void> {
  const sourceDir = join(config.rootDir, "node_modules", "katex", "dist");
  await ensureDir(destDir);
  await Bun.write(join(destDir, "katex.min.css"), Bun.file(join(sourceDir, "katex.min.css")));
  await copyDirectory(join(sourceDir, "fonts"), join(destDir, "fonts"));
}

const timer = new PerformanceTimer();

async function buildIntoCurrentDist(): Promise<void> {
  console.log("📦 Building site...\n");
  errorReporter.reset();
  timer.reset();
  timer.start("total");

  timer.start("setup");
  await validateBuildInputs();
  await ensureDir(config.dirs.dist);
  timer.start("copy-public");
  await copyPublicFiles(config.dirs);
  timer.end("copy-public");

  if (await hasMermaidSource()) {
    await downloadMermaidJS(join(config.dirs.dist, "js", "mermaid.min.js"));
  }
  await copyKatexAssets(join(config.dirs.dist, "katex"));

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

  const primaryCollection = allCollectionOutputs.find(collection => collection.name === "blog")
    || allCollectionOutputs[0];

  timer.start("feeds");
  await generateFeeds(primaryCollection, allCollectionOutputs);
  timer.end("feeds");

  timer.start("llms");
  await generateLlmOutputs(allCollectionOutputs);
  timer.end("llms");

  timer.start("404-page");
  await build404Page(baseLayout, pageLayout, currentYear, defaultOgImageUrl, hooks);
  timer.end("404-page");

  if (hooks.afterBuild) {
    await hooks.afterBuild();
  }

  timer.start("html-audit");
  const htmlAuditIssues = await auditDist(config.dirs.dist);
  const blockingAuditKinds = new Set<HtmlAuditIssueKind>([
    "broken-local-link",
    "broken-fragment",
    "missing-title",
  ]);
  for (const auditIssue of htmlAuditIssues) {
    const context = { kind: auditIssue.kind, file: auditIssue.file };
    if (blockingAuditKinds.has(auditIssue.kind)) {
      errorReporter.report(
        new AppError(`HTML audit: ${auditIssue.message}`, ErrorCode.BUILD_ERROR, context)
      );
    } else {
      errorReporter.reportWarning(`HTML audit: ${auditIssue.message}`, context);
    }
  }
  timer.end("html-audit");

  timer.end("total");
  timer.report();

  const { errors, warnings } = errorReporter.summary();
  if (errors > 0) {
    console.log(`\n✗ Build completed with ${errors} error(s) and ${warnings} warning(s)`);
    throw new AppError(`Build failed with ${errors} error(s)`, ErrorCode.BUILD_ERROR, { errors, warnings });
  } else if (warnings > 0) {
    console.log(`\n✓ Build complete with ${warnings} warning(s)!`);
  } else {
    console.log("\n✓ Build complete!");
  }
}

async function collectFiles(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const filePath = join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, filePath));
    } else if (entry.isFile()) {
      files.push(relative(root, filePath));
    }
  }
  return files;
}

async function replaceFileAtomically(sourcePath: string, destinationPath: string): Promise<void> {
  const parentDirectory = dirname(destinationPath);
  try {
    await ensureDir(parentDirectory);
  } catch (err) {
    const code = err instanceof Error && "code" in err ? (err as NodeJS.ErrnoException).code : undefined;
    if (code !== "EEXIST" && code !== "ENOTDIR") throw err;
    await rm(parentDirectory, { recursive: true, force: true });
    await ensureDir(parentDirectory);
  }
  const temporaryPath = `${destinationPath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    await Bun.write(temporaryPath, Bun.file(sourcePath));
    try {
      await rename(temporaryPath, destinationPath);
    } catch (err) {
      const code = err instanceof Error && "code" in err ? (err as NodeJS.ErrnoException).code : undefined;
      if (code !== "EEXIST" && code !== "EPERM" && code !== "EISDIR" && code !== "ENOTDIR") throw err;
      await rm(destinationPath, { recursive: true, force: true });
      await rename(temporaryPath, destinationPath);
    }
  } catch (err) {
    await rm(temporaryPath, { force: true });
    throw AppError.fromError(err, ErrorCode.FILE_WRITE_ERROR, { sourcePath, destinationPath });
  }
}

async function promoteDist(stagingDist: string, liveDist: string): Promise<void> {
  // Keep the live directory in place and replace each file atomically. This
  // avoids the directory-level gap between renaming live and staging away.
  await ensureDir(liveDist);
  const stagedFiles = await collectFiles(stagingDist);
  const stagedSet = new Set(stagedFiles);

  for (const relativePath of stagedFiles) {
    await replaceFileAtomically(
      join(stagingDist, relativePath),
      join(liveDist, relativePath)
    );
  }

  for (const relativePath of await collectFiles(liveDist)) {
    if (!stagedSet.has(relativePath)) {
      await rm(join(liveDist, relativePath), { force: true });
    }
  }
}

function isProcessAlive(pid: number): boolean {
  if (pid === process.pid) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function acquireBuildLock(): Promise<() => Promise<void>> {
  const ownerPath = join(BUILD_LOCK_DIR, "owner.json");
  const deadline = Date.now() + 120_000;
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  while (true) {
    try {
      await mkdir(BUILD_LOCK_DIR);
      await Bun.write(ownerPath, JSON.stringify({ pid: process.pid, token, startedAt: new Date().toISOString() }));
      return async () => {
        try {
          const owner = JSON.parse(await Bun.file(ownerPath).text()) as { token?: string };
          if (owner.token === token) {
            await rm(BUILD_LOCK_DIR, { recursive: true, force: true });
          }
        } catch (err) {
          if (!isENOENT(err)) throw err;
        }
      };
    } catch (err) {
      const code = err instanceof Error && "code" in err ? (err as NodeJS.ErrnoException).code : undefined;
      if (code !== "EEXIST") throw err;

      let ownerPid: number | undefined;
      let ownerToken: string | undefined;
      try {
        const owner = JSON.parse(await Bun.file(ownerPath).text()) as { pid?: number };
        if (typeof owner.pid === "number") ownerPid = owner.pid;
        if (typeof (owner as { token?: string }).token === "string") {
          ownerToken = (owner as { token: string }).token;
        }
      } catch {
        // A process may be between mkdir and writing owner.json.
      }

      let lockAge = 0;
      let lockMtime = 0;
      try {
        const lockInfo = await stat(BUILD_LOCK_DIR);
        lockMtime = lockInfo.mtimeMs;
        lockAge = Date.now() - lockMtime;
      } catch (statErr) {
        if (!isENOENT(statErr)) throw statErr;
      }

      if ((ownerPid !== undefined && !isProcessAlive(ownerPid)) || (ownerPid === undefined && lockAge >= 120_000)) {
        try {
          const currentLockInfo = await stat(BUILD_LOCK_DIR);
          if (currentLockInfo.mtimeMs !== lockMtime) continue;

          const currentOwner = JSON.parse(await Bun.file(ownerPath).text()) as { token?: string; pid?: number };
          if (ownerToken !== undefined && currentOwner.token !== ownerToken) continue;
          if (ownerToken === undefined && currentOwner.token !== undefined) continue;
          if (ownerPid !== undefined && currentOwner.pid !== ownerPid) continue;
        } catch (recheckErr) {
          if (isENOENT(recheckErr)) continue;
          throw recheckErr;
        }

        const staleLockPath = `${BUILD_LOCK_DIR}.stale-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        try {
          // Rename is one filesystem operation, so two waiters cannot both
          // delete a lock that a new build has already acquired.
          await rename(BUILD_LOCK_DIR, staleLockPath);
          await rm(staleLockPath, { recursive: true, force: true });
        } catch (staleErr) {
          const staleCode = staleErr instanceof Error && "code" in staleErr
            ? (staleErr as NodeJS.ErrnoException).code
            : undefined;
          if (staleCode !== "ENOENT") throw staleErr;
        }
        continue;
      }
      if (Date.now() >= deadline) {
        throw new AppError("Timed out waiting for another build to finish", ErrorCode.BUILD_ERROR, {
          lock: BUILD_LOCK_DIR,
          ownerPid,
        });
      }
      await wait(250);
    }
  }
}

async function buildOnce(): Promise<void> {
  const releaseBuildLock = await acquireBuildLock();
  const liveDist = config.dirs.dist;
  const stagingDist = `${liveDist}.staging-${process.pid}-${Date.now()}`;
  try {
    await rm(stagingDist, { recursive: true, force: true });

    config.dirs.dist = stagingDist;
    let promoted = false;
    try {
      await buildIntoCurrentDist();
      await promoteDist(stagingDist, liveDist);
      promoted = true;
      await rm(stagingDist, { recursive: true, force: true });
    } finally {
      config.dirs.dist = liveDist;
      if (!promoted) await rm(stagingDist, { recursive: true, force: true });
    }
  } finally {
    await releaseBuildLock();
  }
}

let activeBuild: Promise<void> | undefined;

export function build(): Promise<void> {
  if (activeBuild) return activeBuild;

  const currentBuild = buildOnce();
  const guardedBuild = currentBuild.finally(() => {
    if (activeBuild === guardedBuild) activeBuild = undefined;
  });
  activeBuild = guardedBuild;
  return guardedBuild;
}

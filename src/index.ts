import { join } from "path";
import { readFile, writeFile, rm, stat } from "fs/promises";
import { ensureDir, loadLayout, copyPublicFiles } from "./utils/fs.js";
import { buildPage, getInlinedCss } from "./builders/page.js";
import { buildBlogIndex, buildBlogPosts } from "./builders/blog.js";
import { generateRSS } from "./generators/rss.js";
import { generateSitemap } from "./generators/sitemap.js";
import { generateRobotsTxt } from "./generators/robots.js";
import { createCacheManager, hasFileChanged } from "./utils/cache.js";
import { compressHtmlFiles } from "./utils/compress.js";
import config from "./config.js";

// Parse CLI arguments
const args = process.argv.slice(2);
const incremental = args.includes("--incremental") || args.includes("-i");
const watch = args.includes("--watch") || args.includes("-w");
const force = args.includes("--force") || args.includes("-f");

async function build(): Promise<void> {
  console.log(`${force ? "🔨 Force " : ""}${watch ? "👀 Watching" : incremental ? "⚡ Incremental" : "📦"} Building site...\n`);

  const cacheManager = await createCacheManager(config.dirs);
  await ensureDir(config.dirs.dist);

  // Check if config has changed
  const configPath = join(process.cwd(), "src", "config.ts");
  const configMtime = (await stat(configPath)).mtimeMs;
  const configChanged = force || await hasFileChanged(configPath, cacheManager.getConfigMtime());
  if (configChanged) {
    cacheManager.setConfigMtime(configMtime);
  }

  // Load layouts (always reload as they're templates)
  const layoutsChanged: Record<string, boolean> = {};
  const layouts = ["base", "page", "blog-index", "blog-post"];
  for (const layout of layouts) {
    const layoutPath = join(config.dirs.layouts, `${layout}.html`);
    const layoutMtime = (await stat(layoutPath)).mtimeMs;
    layoutsChanged[layout] = force || (await hasFileChanged(layoutPath, cacheManager.getLayoutMtime(layout)));
    if (layoutsChanged[layout]) {
      cacheManager.setLayoutMtime(layout, layoutMtime);
    }
  }

  const baseLayout = await loadLayout("base", config.dirs.layouts);
  const pageLayout = await loadLayout("page", config.dirs.layouts);
  const blogIndexLayout = await loadLayout("blog-index", config.dirs.layouts);
  const blogPostLayout = await loadLayout("blog-post", config.dirs.layouts);

// Get current year for templates
const currentYear = new Date().getFullYear();

// Pre-load inlined CSS for critical rendering path
const inlinedCss = await getInlinedCss();

// Build static pages
  let pagesChanged = false;
  for (const [route, file] of Object.entries(config.routes)) {
    if (route === "/blog") continue;
    const filePath = join(config.dirs.pages, file);
    try {
      const fileMtime = (await stat(filePath)).mtimeMs;
      const shouldBuild =
        force ||
        configChanged ||
        layoutsChanged.base ||
        layoutsChanged.page ||
        (await hasFileChanged(filePath, cacheManager.getPageMtime(filePath)));

      if (shouldBuild) {
        await buildPage(route, filePath, baseLayout, pageLayout, currentYear);
        cacheManager.setPageMtime(filePath, fileMtime);
        pagesChanged = true;
      } else {
        console.log(`⏭ Skipped ${route} (unchanged)`);
      }
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === "ENOENT") {
        console.warn(`⚠ Warning: ${filePath} not found, skipping ${route}`);
      } else {
        throw err;
      }
    }
  }

  // Build blog
  const { posts, indexChanged, postsChanged } = await buildBlogIndex(
    baseLayout,
    blogIndexLayout,
    cacheManager,
    force || configChanged || layoutsChanged.base || layoutsChanged["blog-index"],
    currentYear,
    inlinedCss
  );
  await buildBlogPosts(
    posts,
    baseLayout,
    blogPostLayout,
    cacheManager,
    force || configChanged || layoutsChanged.base || layoutsChanged["blog-post"],
    currentYear,
    inlinedCss
  );

  // Generate feeds (always regenerate as they depend on posts)
  if (config.rss.enabled) await generateRSS(posts);
  if (config.sitemap.enabled) await generateSitemap(posts);
  if (config.robots.enabled) await generateRobotsTxt();

  // Build 404 page
  const filePath404 = join(config.dirs.pages, "404.md");
  try {
    await buildPage("/404", filePath404, baseLayout, pageLayout, currentYear);
    const dist404Path = join(config.dirs.dist, "404.html");
    const dist404DirPath = join(config.dirs.dist, "404", "index.html");
    try {
      const content = await readFile(dist404DirPath, "utf-8");
      await writeFile(dist404Path, content, "utf-8");
      await rm(join(config.dirs.dist, "404"), { recursive: true, force: true });
    } catch { /* ignore */ }
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      console.warn("⚠ Warning: 404.md not found, skipping 404 page");
    } else {
      throw err;
    }
  }

  await copyPublicFiles(config.dirs);

  // Compress HTML files (CSS is inlined)
  console.log("\n🗜 Compressing static assets...");
  await compressHtmlFiles(config.dirs);

  // Save cache
  cacheManager.save();

  const changedCount = pagesChanged || indexChanged ? "some" : "no";
  console.log(`\n✓ Build complete! (${changedCount} files changed)`);
}

// Run build
build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});


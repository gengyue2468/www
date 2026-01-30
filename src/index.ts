import { join, dirname } from "path";
import { stat, readFile, rm, writeFile } from "fs/promises";
import { ensureDir, loadLayout, copyPublicFiles } from "./utils/fs.js";
import { buildPage, getInlinedCss } from "./builders/page.js";
import { buildBlogIndex, buildBlogPosts } from "./builders/blog.js";
import { generateRSS } from "./generators/rss.js";
import { generateSitemap } from "./generators/sitemap.js";
import { generateRobotsTxt } from "./generators/robots.js";
import { registerPlugin } from "./extensions/plugin.js";
import { mermaidPlugin } from "./extensions/mermaid.js";
import config from "./config.js";

// Register plugins
registerPlugin(mermaidPlugin);

async function build(): Promise<void> {
  console.log("📦 Building site...\n");

  await ensureDir(config.dirs.dist);

  // Load layouts
  const baseLayout = await loadLayout("base", config.dirs.layouts);
  const pageLayout = await loadLayout("page", config.dirs.layouts);
  const blogIndexLayout = await loadLayout("blog-index", config.dirs.layouts);
  const blogPostLayout = await loadLayout("blog-post", config.dirs.layouts);

  const currentYear = new Date().getFullYear();
  const inlinedCss = await getInlinedCss();

  // Build static pages
  for (const [route, file] of Object.entries(config.routes)) {
    if (route === "/blog") continue;
    const filePath = join(config.dirs.pages, file);
    try {
      await stat(filePath);
      await buildPage(route, filePath, baseLayout, pageLayout, currentYear);
      console.log(`✓ Built ${route}`);
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
  const posts = await buildBlogIndex(baseLayout, blogIndexLayout, currentYear, inlinedCss);
  await buildBlogPosts(posts, baseLayout, blogPostLayout, currentYear, inlinedCss);

  // Generate feeds
  if (config.rss.enabled) await generateRSS(posts);
  if (config.sitemap.enabled) await generateSitemap(posts);
  if (config.robots.enabled) await generateRobotsTxt();

  // Build 404 page
  const filePath404 = join(config.dirs.pages, "404.md");
  try {
    await stat(filePath404);
    await buildPage("/404", filePath404, baseLayout, pageLayout, currentYear);
    // Copy 404/index.html to 404.html and remove directory
    const dist404DirPath = join(config.dirs.dist, "404", "index.html");
    const dist404Path = join(config.dirs.dist, "404.html");
    try {
      const content = await readFile(dist404DirPath, "utf-8");
      await writeFile(dist404Path, content, "utf-8");
      await rm(join(config.dirs.dist, "404"), { recursive: true, force: true });
    } catch { /* ignore */ }
    console.log("✓ Built /404");
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") {
      throw err;
    }
  }

  await copyPublicFiles(config.dirs);

  console.log("\n✓ Build complete!");
}

// Run build
build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});

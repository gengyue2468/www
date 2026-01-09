import { join } from "path";
import { readFile, writeFile, stat, rm } from "fs/promises";
import { ensureDir, loadLayout, copyPublicFiles } from "./utils/fs.js";
import { buildPage } from "./builders/page.js";
import { buildBlogIndex, buildBlogPosts } from "./builders/blog.js";
import { generateRSS } from "./generators/rss.js";
import { generateSitemap } from "./generators/sitemap.js";
import { generateRobotsTxt } from "./generators/robots.js";
import config from "./config.js";

/**
 * Main build function
 */
async function build(): Promise<void> {
  console.log("Building site...\n");

  // Ensure dist directory exists
  await ensureDir(config.dirs.dist);

  // Load layouts
  const baseLayout = await loadLayout("base", config.dirs.layouts);
  const pageLayout = await loadLayout("page", config.dirs.layouts);
  const blogIndexLayout = await loadLayout("blog-index", config.dirs.layouts);
  const blogPostLayout = await loadLayout("blog-post", config.dirs.layouts);

  // Build static pages (skip /blog as it's generated automatically)
  for (const [route, file] of Object.entries(config.routes)) {
    if (route === "/blog") continue; // Skip, will be generated from blog posts
    const filePath = join(config.dirs.pages, file);
    try {
      await buildPage(route, filePath, baseLayout, pageLayout);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === "ENOENT") {
        console.warn(`⚠ Warning: ${filePath} not found, skipping ${route}`);
      } else {
        throw err;
      }
    }
  }

  // Build blog index and posts
  const posts = await buildBlogIndex(baseLayout, blogIndexLayout);
  await buildBlogPosts(posts, baseLayout, blogPostLayout);

  // Generate RSS feed
  if (config.rss.enabled) {
    await generateRSS(posts);
  }

  // Generate sitemap
  if (config.sitemap.enabled) {
    await generateSitemap(posts);
  }

  // Generate robots.txt
  if (config.robots.enabled) {
    await generateRobotsTxt();
  }

  // Build 404 page
  const filePath404 = join(config.dirs.pages, "404.md");
  try {
    await buildPage("/404", filePath404, baseLayout, pageLayout);
    // Rename to 404.html in root
    const dist404Path = join(config.dirs.dist, "404.html");
    const dist404DirPath = join(config.dirs.dist, "404", "index.html");
    try {
      const content = await readFile(dist404DirPath, "utf-8");
      await writeFile(dist404Path, content, "utf-8");
      // Remove the 404 directory
      await rm(join(config.dirs.dist, "404"), { recursive: true, force: true });
    } catch {
      // File doesn't exist, skip
    }
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === "ENOENT") {
      console.warn("⚠ Warning: 404.md not found, skipping 404 page");
    } else {
      throw err;
    }
  }

  // Copy public files
  await copyPublicFiles(config.dirs);

  console.log("\n✓ Build complete!");
}

// Run build
build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});


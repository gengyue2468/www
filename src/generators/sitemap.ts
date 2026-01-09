import { join } from "path";
import { writeFile } from "fs/promises";
import { SitemapStream, streamToPromise } from "sitemap";
import config from "../config.js";
import type { Post } from "../types.js";

/**
 * Generate sitemap.xml using sitemap library
 */
export async function generateSitemap(posts: Post[]): Promise<void> {
  if (!config.sitemap.enabled) return;

  const siteUrl = config.site.url;
  const now = new Date();

  // Create sitemap stream
  const sitemap = new SitemapStream({
    hostname: siteUrl,
  });

  // Add home page
  sitemap.write({
    url: "/",
    changefreq: config.sitemap.changefreq as any,
    priority: config.sitemap.priority.home,
    lastmod: now,
  });

  // Add static pages
  for (const [route] of Object.entries(config.routes)) {
    if (route === "/blog") continue;
    sitemap.write({
      url: route,
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.pages,
      lastmod: now,
    });
  }

  // Add blog index
  sitemap.write({
    url: "/blog",
    changefreq: config.sitemap.changefreq as any,
    priority: config.sitemap.priority.blog,
    lastmod: now,
  });

  // Add blog posts
  for (const post of posts) {
    const postDate = post.date ? new Date(post.date) : now;
    sitemap.write({
      url: `/blog/${post.slug}`,
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.posts,
      lastmod: postDate,
    });
  }

  // End the stream
  sitemap.end();

  // Convert stream to promise and get XML
  const sitemapXml = await streamToPromise(sitemap);

  const sitemapPath = join(config.dirs.dist, "sitemap.xml");
  await writeFile(sitemapPath, sitemapXml.toString(), "utf-8");
  console.log(`✓ Generated sitemap -> ${sitemapPath}`);
}

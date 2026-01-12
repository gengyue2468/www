import { join } from "path";
import { writeFile } from "fs/promises";
import { SitemapStream, streamToPromise } from "sitemap";
import config from "../config.js";
import type { Post } from "../types.js";

export async function generateSitemap(posts: Post[]): Promise<void> {
  if (!config.sitemap.enabled) return;

  const siteUrl = config.site.url;
  const now = new Date();

  const sitemap = new SitemapStream({ hostname: siteUrl });

  sitemap.write({
    url: "/",
    changefreq: config.sitemap.changefreq as any,
    priority: config.sitemap.priority.home,
    lastmod: now,
  });

  for (const [route] of Object.entries(config.routes)) {
    if (route === "/blog") continue;
    sitemap.write({
      url: route,
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.pages,
      lastmod: now,
    });
  }

  sitemap.write({
    url: "/blog",
    changefreq: config.sitemap.changefreq as any,
    priority: config.sitemap.priority.blog,
    lastmod: now,
  });

  for (const post of posts) {
    const postDate = post.date ? new Date(post.date) : now;
    sitemap.write({
      url: `/blog/${post.slug}`,
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.posts,
      lastmod: postDate,
    });
  }

  sitemap.end();

  const sitemapXml = await streamToPromise(sitemap);
  const sitemapPath = join(config.dirs.dist, "sitemap.xml");
  await writeFile(sitemapPath, sitemapXml.toString(), "utf-8");
  console.log(`✓ Generated sitemap -> ${sitemapPath}`);
}

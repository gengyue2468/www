import { join } from "path";
import { SitemapStream, streamToPromise } from "sitemap";
import config from "../config.js";
import { writeFileContent } from "../utils/fs.js";
import type { Post } from "../types.js";

/**
 * Generate sitemap using optimized file writing
 */
export async function generateSitemap(posts: Post[]): Promise<void> {
  if (!config.sitemap.enabled) return;

  const siteUrl = config.site.url;
  const now = new Date();

  const sitemap = new SitemapStream({ hostname: siteUrl });

  // Write entries using array for batch processing
  const entries = [
    {
      url: "/",
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.home,
      lastmod: now,
    },
    ...Object.entries(config.routes)
      .filter(([route]) => route !== "/blog")
      .map(([route]) => ({
        url: route,
        changefreq: config.sitemap.changefreq as any,
        priority: config.sitemap.priority.pages,
        lastmod: now,
      })),
    {
      url: "/blog",
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.blog,
      lastmod: now,
    },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.posts,
      lastmod: post.date ? new Date(post.date) : now,
    })),
  ];

  // Write all entries
  for (const entry of entries) {
    sitemap.write(entry);
  }

  sitemap.end();

  const sitemapXml = await streamToPromise(sitemap);
  const sitemapPath = join(config.dirs.dist, "sitemap.xml");
  await writeFileContent(sitemapPath, sitemapXml.toString());
  console.log(`✓ Generated sitemap -> ${sitemapPath}`);
}

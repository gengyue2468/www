import { join } from "path";
import { SitemapStream, streamToPromise } from "sitemap";
import config from "../config.js";
import { writeFileContent } from "../utils/fs.js";
import type { CollectionOutput } from "../types.js";

export async function generateSitemap(collections: CollectionOutput[]): Promise<void> {
  if (!config.sitemap.enabled) return;

  const siteUrl = config.site.url;
  const now = new Date();

  const sitemap = new SitemapStream({ hostname: siteUrl });

  const collectionRoutes = new Set(
    collections.map(c => `/${c.urlPrefix}`)
  );

  const entries = [
    {
      url: "/",
      changefreq: config.sitemap.changefreq as any,
      priority: config.sitemap.priority.home,
      lastmod: now,
    },
    ...Object.entries(config.routes)
      .filter(([route]) => !collectionRoutes.has(route))
      .map(([route]) => ({
        url: route,
        changefreq: config.sitemap.changefreq as any,
        priority: config.sitemap.priority.pages,
        lastmod: now,
      })),
    ...collections.flatMap(collection => [
      {
        url: `/${collection.urlPrefix}`,
        changefreq: config.sitemap.changefreq as any,
        priority: config.sitemap.priority.blog,
        lastmod: now,
      },
      ...collection.items.map((post) => ({
        url: `/${collection.urlPrefix}/${post.slug}`,
        changefreq: config.sitemap.changefreq as any,
        priority: config.sitemap.priority.posts,
        lastmod: post.date ? new Date(post.date) : now,
      })),
    ]),
  ];

  for (const entry of entries) {
    sitemap.write(entry);
  }

  sitemap.end();

  const sitemapXml = await streamToPromise(sitemap);
  const sitemapPath = join(config.dirs.dist, "sitemap.xml");
  await writeFileContent(sitemapPath, sitemapXml.toString());
  console.log(`✓ Generated sitemap -> ${sitemapPath}`);
}

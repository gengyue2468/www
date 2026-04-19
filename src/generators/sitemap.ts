import { join } from "path";
import { SitemapStream, streamToPromise } from "sitemap";
import config from "../config.js";
import { writeFileContent } from "../utils/fs.js";
import type { CollectionOutput } from "../types.js";

export async function generateSitemap(collections: CollectionOutput[]): Promise<void> {
  if (!config.sitemap.enabled) return;

  const siteUrl = config.site.url;
  const now = new Date();
  const cf = config.sitemap;

  const sitemap = new SitemapStream({ hostname: siteUrl });

  const collectionRoutes = new Set(
    collections.map(c => `/${c.urlPrefix}`)
  );

  const entries = [
    {
      url: "/",
      changefreq: (cf.changefreqHome || cf.changefreq) as any,
      priority: cf.priority.home,
      lastmod: now,
    },
    ...Object.entries(config.routes)
      .filter(([route]) => !collectionRoutes.has(route) && route !== "/")
      .map(([route]) => ({
        url: route,
        changefreq: (cf.changefreqPages || cf.changefreq) as any,
        priority: cf.priority.pages,
        lastmod: now,
      })),
    ...collections.flatMap(collection => [
      {
        url: `/${collection.urlPrefix}`,
        changefreq: (cf.changefreqBlog || cf.changefreq) as any,
        priority: cf.priority.blog,
        lastmod: now,
      },
      ...collection.items.map((post) => ({
        url: `/${collection.urlPrefix}/${post.slug}`,
        changefreq: (cf.changefreqPosts || cf.changefreq) as any,
        priority: cf.priority.posts,
        lastmod: post.updated
          ? new Date(post.updated)
          : post.date
            ? new Date(post.date)
            : now,
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

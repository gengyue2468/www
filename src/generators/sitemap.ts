import { join } from "path";
import { SitemapStream, streamToPromise } from "sitemap";
import config from "../config.js";
import { writeFileContent } from "../utils/fs.js";
import { cleanBaseUrl, joinUrlPath } from "../utils/url.js";
import { collectionTagIndex, latestLastmod, readPageMetadata, sourceLastmod } from "../utils/discovery.js";
import { sortPostsByDate } from "../utils/tags.js";
import type { CollectionOutput, SitemapConfig } from "../types.js";

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapEntry {
  url: string;
  changefreq: ChangeFreq;
  priority: number;
  lastmod?: string;
}

function getChangeFreq(key: keyof SitemapConfig): ChangeFreq {
  return (config.sitemap[key] as string || config.sitemap.changefreq) as ChangeFreq;
}

export async function buildSitemapEntries(collections: readonly CollectionOutput[]): Promise<SitemapEntry[]> {
  const cf = config.sitemap;
  const collectionRoutes = new Set(
    collections.map(c => joinUrlPath(c.urlPrefix))
  );
  const pageEntries = await Promise.all(
    Object.entries(config.routes)
      .filter(([route]) => !collectionRoutes.has(route) && route !== "/404")
      .sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(async ([route, file]): Promise<SitemapEntry> => {
        const { lastmod } = await readPageMetadata(join(config.dirs.pages, file));
        return {
          url: route,
          changefreq: getChangeFreq(route === "/" ? "changefreqHome" : "changefreqPages"),
          priority: route === "/" ? cf.priority.home : cf.priority.pages,
          lastmod,
        };
      })
  );

  const orderedCollections = [...collections].sort((a, b) => a.urlPrefix.localeCompare(b.urlPrefix, "en"));
  const collectionEntries = (await Promise.all(orderedCollections.map(async collection => {
    const postEntries = await Promise.all(sortPostsByDate(collection.items).map(async (post): Promise<SitemapEntry> => ({
      url: joinUrlPath(collection.urlPrefix, post.slug),
      changefreq: getChangeFreq("changefreqPosts"),
      priority: cf.priority.posts,
      lastmod: await sourceLastmod(post, join(collection.srcDir, `${post.slug}.md`)),
    })));
    const lastmod = latestLastmod(postEntries.map(entry => entry.lastmod));
    const datesByUrl = new Map(postEntries.map(entry => [entry.url, entry.lastmod]));
    const tags = collectionTagIndex(collection);
    const tagEntries: SitemapEntry[] = tags.length ? [
      {
        url: joinUrlPath(collection.urlPrefix, "tag"),
        changefreq: getChangeFreq("changefreqTags"),
        priority: cf.priority.tags ?? cf.priority.pages,
        lastmod,
      },
      ...tags.map(tag => ({
        url: joinUrlPath(collection.urlPrefix, "tag", tag.slug),
        changefreq: getChangeFreq("changefreqTags"),
        priority: cf.priority.tags ?? cf.priority.pages,
        lastmod: latestLastmod(tag.posts.map(post => datesByUrl.get(joinUrlPath(collection.urlPrefix, post.slug)))),
      })),
    ] : [];

    return [
      {
        url: joinUrlPath(collection.urlPrefix),
        changefreq: getChangeFreq("changefreqBlog"),
        priority: cf.priority.blog,
        lastmod,
      },
      ...tagEntries,
      ...postEntries,
    ];
  }))).flat();

  const entries = new Map<string, SitemapEntry>();
  for (const entry of [...pageEntries, ...collectionEntries]) {
    const previous = entries.get(entry.url);
    entries.set(entry.url, previous
      ? { ...previous, lastmod: latestLastmod([previous.lastmod, entry.lastmod]) }
      : entry);
  }
  return [...entries.values()];
}

export async function generateSitemap(collections: CollectionOutput[]): Promise<void> {
  if (!config.sitemap.enabled) return;

  const entries = await buildSitemapEntries(collections);
  const sitemap = new SitemapStream({
    hostname: cleanBaseUrl(config.site.url),
    lastmodDateOnly: true,
    xmlns: { news: false, xhtml: false, image: false, video: false },
  });
  // Attach the stream reader before writing, including for larger archives.
  const sitemapXml = streamToPromise(sitemap);
  for (const entry of entries) sitemap.write(entry);
  sitemap.end();

  const xml = (await sitemapXml).toString()
    .replace("<urlset", "\n<urlset")
    .replaceAll("<url>", "\n  <url>")
    .replace("</urlset>", "\n</urlset>\n");
  const sitemapPath = join(config.dirs.dist, "sitemap.xml");
  await writeFileContent(sitemapPath, xml);
  console.log(`✓ Generated sitemap -> ${sitemapPath}`);
}

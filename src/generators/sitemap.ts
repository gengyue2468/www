import { join } from "path";
import { stat } from "fs/promises";
import { SitemapStream, streamToPromise } from "sitemap";
import config from "../config.js";
import { writeFileContent } from "../utils/fs.js";
import { joinUrlPath } from "../utils/url.js";
import { parseCalendarDate } from "../utils/date.js";
import { isENOENT } from "../utils/errors.js";
import type { CollectionOutput, SitemapConfig } from "../types.js";

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

function getChangeFreq(key: keyof SitemapConfig): ChangeFreq {
  return (config.sitemap[key] as string || config.sitemap.changefreq) as ChangeFreq;
}

async function getSourceMtime(filePath: string, fallback: Date): Promise<Date> {
  try {
    const info = await stat(filePath);
    return new Date(info.mtimeMs);
  } catch (err) {
    if (isENOENT(err)) return fallback;
    throw err;
  }
}

function getPostLastmod(updated: string | undefined, date: string | undefined, fallback: Date): Date {
  return parseCalendarDate(updated) || parseCalendarDate(date) || fallback;
}

export async function generateSitemap(collections: CollectionOutput[]): Promise<void> {
  if (!config.sitemap.enabled) return;

  const siteUrl = config.site.url;
  const now = new Date();
  const cf = config.sitemap;

  const sitemap = new SitemapStream({ hostname: siteUrl });

  const collectionRoutes = new Set(
    collections.map(c => joinUrlPath(c.urlPrefix))
  );

  const homeLastmod = await getSourceMtime(join(config.dirs.pages, config.routes["/"]), now);
  const pageEntries = await Promise.all(
    Object.entries(config.routes)
      .filter(([route]) => !collectionRoutes.has(route) && route !== "/")
      .map(async ([route, file]) => ({
        url: route,
        changefreq: getChangeFreq("changefreqPages"),
        priority: cf.priority.pages,
        lastmod: await getSourceMtime(join(config.dirs.pages, file), now),
      }))
  );

  const collectionEntries = (await Promise.all(collections.map(async collection => {
    const postEntries = await Promise.all(collection.items.map(async post => {
      const fallback = getPostLastmod(post.updated, post.date, now);
      return {
        url: joinUrlPath(collection.urlPrefix, post.slug),
        changefreq: getChangeFreq("changefreqPosts"),
        priority: cf.priority.posts,
        lastmod: fallback,
      };
    }));

    const latestPostDate = collection.items.reduce((latest, post) => {
      const postDate = getPostLastmod(post.updated, post.date, new Date(0));
      return postDate > latest ? postDate : latest;
    }, new Date(0));

    return [
      {
        url: joinUrlPath(collection.urlPrefix),
        changefreq: getChangeFreq("changefreqBlog"),
        priority: cf.priority.blog,
        lastmod: latestPostDate.getTime() > 0
          ? latestPostDate
          : await getSourceMtime(collection.srcDir, now),
      },
      ...postEntries,
    ];
  }))).flat();

  const entries = [
    {
      url: "/",
      changefreq: getChangeFreq("changefreqHome"),
      priority: cf.priority.home,
      lastmod: homeLastmod,
    },
    ...pageEntries,
    ...collectionEntries,
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

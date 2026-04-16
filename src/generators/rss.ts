import { join } from "path";
import { Feed } from "feed";
import config from "../config.js";
import { writeFileContent } from "../utils/fs.js";
import type { CollectionOutput } from "../types.js";

export async function generateRSS(collection: CollectionOutput): Promise<void> {
  if (!config.rss.enabled) return;

  const siteUrl = config.site.url;
  const rssItems = collection.items.slice(0, config.rss.items.limit);
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  const feed = new Feed({
    title: config.rss.title,
    description: config.rss.description,
    id: cleanSiteUrl,
    link: cleanSiteUrl,
    language: config.rss.language,
    copyright: config.rss.copyright,
    updated: new Date(),
    generator: "Paper Blog",
    author: { name: config.site.author },
    feedLinks: { rss2: `${cleanSiteUrl}/rss.xml` },
  });

  for (const post of rssItems) {
    const postUrl = `${cleanSiteUrl}/${collection.urlPrefix}/${post.slug}`;
    const description = post.summary || post.excerpt || config.site.description;
    const date = post.date ? new Date(post.date) : new Date();

    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description,
      date,
      author: [{ name: config.site.author }],
    });
  }

  const rssXml = feed.rss2();
  const rssPath = join(config.dirs.dist, "rss.xml");
  await writeFileContent(rssPath, rssXml);
  console.log(`✓ Generated RSS feed -> ${rssPath}`);
}

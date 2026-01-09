import { join } from "path";
import { writeFile } from "fs/promises";
import { Feed } from "feed";
import config from "../config.js";
import type { Post } from "../types.js";

/**
 * Generate RSS feed using feed library
 */
export async function generateRSS(posts: Post[]): Promise<void> {
  if (!config.rss.enabled) return;

  const siteUrl = config.site.url;
  const rssItems = posts.slice(0, config.rss.items.limit);

  // Ensure siteUrl doesn't end with slash to avoid double slashes
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");

  // Create feed instance
  const feed = new Feed({
    title: config.rss.title,
    description: config.rss.description,
    id: cleanSiteUrl,
    link: cleanSiteUrl,
    language: config.rss.language,
    copyright: config.rss.copyright,
    updated: new Date(),
    generator: "Paper Blog",
    author: {
      name: config.site.author,
    },
    feedLinks: {
      rss2: `${cleanSiteUrl}/rss.xml`,
    },
  });

  // Add posts as feed items
  for (const post of rssItems) {
    const postUrl = `${cleanSiteUrl}/blog/${post.slug}`;
    const description = post.summary || post.excerpt || config.site.description;
    const date = post.date ? new Date(post.date) : new Date();

    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: description,
      date: date,
      author: [
        {
          name: config.site.author,
        },
      ],
    });
  }

  // Generate RSS 2.0 XML
  const rssXml = feed.rss2();

  const rssPath = join(config.dirs.dist, "rss.xml");
  await writeFile(rssPath, rssXml, "utf-8");
  console.log(`✓ Generated RSS feed -> ${rssPath}`);
}

import { join } from "path";
import { Feed } from "feed";
import config from "../config.js";
import { writeFileContent } from "../utils/fs.js";
import { cleanBaseUrl, joinUrlPath } from "../utils/url.js";
import { parseCalendarDate } from "../utils/date.js";
import { htmlToPlainText, smartTruncate } from "../utils/seo.js";
import type { CollectionOutput } from "../types.js";

function findClosingSpan(html: string, contentStart: number): number {
  const tags = /<\/?span\b[^>]*>/gi;
  tags.lastIndex = contentStart;
  let depth = 1;
  let match: RegExpExecArray | null;

  while ((match = tags.exec(html)) !== null) {
    if (match[0].startsWith("</")) {
      depth--;
      if (depth === 0) return match.index;
    } else if (!match[0].endsWith("/>") && !match[0].includes("/>")) {
      depth++;
    }
  }

  return -1;
}

function replaceNoteSpans(html: string, pattern: RegExp, className: string, prefix: string): string {
  let result = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const contentStart = pattern.lastIndex;
    const contentEnd = findClosingSpan(html, contentStart);
    if (contentEnd === -1) break;

    result += html.slice(cursor, match.index);
    const noteContent = html.slice(contentStart, contentEnd).trim();
    result += ` <span class="${className}">${prefix}${noteContent})</span>`;
    cursor = contentEnd + "</span>".length;
  }

  return result + html.slice(cursor);
}

export function htmlForRss(html: string): string {
  const base = cleanBaseUrl(config.site.url);
  let content = html.replace(/<footer class="notes-list">[\s\S]*?<\/footer>/gi, "");

  content = replaceNoteSpans(
    content,
    /<label[^>]*class="margin-toggle sidenote-number"[^>]*><\/label><input[^>]*class="margin-toggle"[^>]*\/><span class="sidenote">/gi,
    "rss-sidenote",
    "("
  );
  content = replaceNoteSpans(
    content,
    /<label[^>]*class="margin-toggle"(?![^>]*sidenote-number)[^>]*>[\s\S]*?<\/label><input[^>]*class="margin-toggle"[^>]*\/><span class="marginnote">/gi,
    "rss-marginnote",
    "⊕ ("
  );

  return content.replace(/(\s(?:href|src)=")\/(?!\/)([^"]*)"/gi, `$1${base}/$2"`);
}

export async function generateRSS(collection: CollectionOutput): Promise<void> {
  if (!config.rss.enabled) return;

  const rssItems = collection.items.slice(0, config.rss.items.limit);
  const cleanSiteUrl = cleanBaseUrl(config.site.url);

  const feed = new Feed({
    title: config.rss.title,
    description: config.rss.description,
    id: cleanSiteUrl,
    link: cleanSiteUrl,
    language: config.rss.language,
    copyright: config.rss.copyright,
    updated: collection.items.reduce((latest, post) => {
      const postDate = parseCalendarDate(post.updated) || parseCalendarDate(post.date);
      return postDate && postDate > latest ? postDate : latest;
    }, new Date(0)),
    generator: "Nofte",
    author: { name: config.site.author },
    feedLinks: { rss2: `${cleanSiteUrl}/rss.xml` },
  });

  const renderedMap = new Map(
    collection.renderedItems.map(r => [r.slug, r.html])
  );

  for (const post of rssItems) {
    const postUrl = `${cleanSiteUrl}${joinUrlPath(collection.urlPrefix, post.slug)}`;
    const rawHtml = renderedMap.get(post.slug);
    const content = rawHtml ? htmlForRss(rawHtml) : undefined;
    const description = post.summary || post.excerpt ||
      (content ? smartTruncate(htmlToPlainText(content), 300) : config.site.description);
    const date = parseCalendarDate(post.date) || new Date(0);

    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description,
      content,
      date,
      author: [{ name: config.site.author }],
    });
  }

  const rssXml = feed.rss2();
  const rssPath = join(config.dirs.dist, "rss.xml");
  await writeFileContent(rssPath, rssXml);
  console.log(`✓ Generated RSS feed -> ${rssPath}`);
}

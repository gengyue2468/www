import { join } from "path";
import config from "../config.js";
import type { CollectionOutput, TagCatalog, TagCatalogPost } from "../types.js";
import { buildTagIndex, sortPostsByDate, validatePostTags } from "../utils/tags.js";
import { writeFileContent } from "../utils/fs.js";
import { joinUrlPath } from "../utils/url.js";
import { AppError, ErrorCode } from "../utils/errors.js";

export function buildTagCatalog(collections: readonly CollectionOutput[]): TagCatalog {
  const ids = new Set<string>();
  const posts = sortPostsByDate(collections.flatMap(collection => collection.items.map(post => {
    const href = joinUrlPath(collection.urlPrefix, post.slug);
    if (ids.has(href)) {
      throw new AppError(`Duplicate post in tag catalog: '${href}'`, ErrorCode.CONFIG_ERROR, { href });
    }
    ids.add(href);
    const tags = validatePostTags(post.tags, href);
    return {
      id: href,
      href,
      slug: post.slug,
      collection: collection.name,
      title: post.title,
      date: post.date,
      updated: post.updated,
      summary: post.summary || post.excerpt || "",
      tags,
      primaryTag: tags[0],
    } satisfies TagCatalogPost;
  })));

  return {
    version: 1,
    totalPosts: posts.length,
    tags: buildTagIndex(posts).map(({ posts: taggedPosts, ...tag }) => ({
      ...tag,
      postIds: taggedPosts.map(post => post.id),
    })),
    posts,
  };
}

export async function generateTagCatalog(collections: readonly CollectionOutput[]): Promise<void> {
  const path = join(config.dirs.dist, "tags.json");
  await writeFileContent(path, JSON.stringify(buildTagCatalog(collections)));
  console.log(`✓ Generated tag catalog -> ${path}`);
}

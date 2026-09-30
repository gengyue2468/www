import { TAG_DEFINITIONS, MAX_POST_TAGS, type TagDefinition, type TagName } from "../taxonomy.js";
import { parseCalendarDate } from "./date.js";
import { AppError, ErrorCode } from "./errors.js";

function createTagRegistry(): Map<string, TagDefinition> {
  const registry = new Map<string, TagDefinition>();
  const slugs = new Set<string>();
  for (const tag of TAG_DEFINITIONS) {
    if (!/^[A-Z][a-z]{1,5}$/.test(tag.name) || !/^[a-z]+$/.test(tag.slug)) {
      throw new AppError(`Invalid topic definition '${tag.name}'`, ErrorCode.CONFIG_ERROR, { tag });
    }
    if (registry.has(tag.name) || slugs.has(tag.slug)) {
      throw new AppError(`Duplicate topic name or slug '${tag.name}'`, ErrorCode.CONFIG_ERROR, { tag });
    }
    registry.set(tag.name, tag);
    slugs.add(tag.slug);
  }
  return registry;
}

const definitions = createTagRegistry();

export function getTagDefinition(name: TagName): TagDefinition {
  return definitions.get(name)!;
}

export function validatePostTags(value: unknown, context: string): TagName[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_POST_TAGS) {
    throw new AppError(`Posts need 1–${MAX_POST_TAGS} tags, with the primary tag first`, ErrorCode.CONFIG_ERROR, { context });
  }

  const tags: TagName[] = [];
  for (const tag of value) {
    const definition = typeof tag === "string" ? definitions.get(tag) : undefined;
    if (!definition) {
      throw new AppError(`Unknown tag '${String(tag)}'; use a label from src/taxonomy.ts`, ErrorCode.CONFIG_ERROR, { context });
    }
    if (tags.includes(definition.name)) {
      throw new AppError(`Duplicate tag '${tag}'`, ErrorCode.CONFIG_ERROR, { context });
    }
    tags.push(definition.name);
  }
  return tags;
}

export function sortPostsByDate<T extends { date?: string; slug: string; href?: string }>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => {
    const aTime = parseCalendarDate(a.date)?.getTime();
    const bTime = parseCalendarDate(b.date)?.getTime();
    if (aTime !== undefined && bTime === undefined) return -1;
    if (aTime === undefined && bTime !== undefined) return 1;
    if (aTime !== undefined && bTime !== undefined && aTime !== bTime) return bTime - aTime;
    return (a.href || a.slug).localeCompare(b.href || b.slug);
  });
}

export interface TagGroup<T> {
  name: TagName;
  slug: string;
  description: string;
  count: number;
  primaryCount: number;
  posts: T[];
}

// One shared index for tag navigation, archive pages, and the site-wide catalog.
export function buildTagIndex<T extends { slug: string; date?: string; tags: readonly string[] }>(
  posts: readonly T[],
): TagGroup<T>[] {
  const groups = new Map<TagName, TagGroup<T>>();
  for (const post of sortPostsByDate(posts)) {
    const tags = validatePostTags(post.tags, post.slug);
    for (const [index, name] of tags.entries()) {
      let group = groups.get(name);
      if (!group) {
        group = { ...getTagDefinition(name), count: 0, primaryCount: 0, posts: [] };
        groups.set(name, group);
      }
      group.posts.push(post);
      group.count++;
      if (index === 0) group.primaryCount++;
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

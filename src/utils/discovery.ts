import { readFile, stat } from "fs/promises";
import matter from "gray-matter";
import config from "../config.js";
import type { CollectionOutput } from "../types.js";
import { parseCalendarDate } from "./date.js";
import { isENOENT } from "./errors.js";
import { buildTagIndex } from "./tags.js";

export function collectionTagIndex(collection: CollectionOutput) {
  return config.collections.some(coll => coll.name === collection.name && coll.tags)
    ? buildTagIndex(collection.items)
    : [];
}

function calendarDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : parseCalendarDate(value.toISOString().slice(0, 10));
  }
  return typeof value === "string" ? parseCalendarDate(value) : undefined;
}

// Prefer declared content dates. Fall back to source mtime, never build time.
// Future or malformed values should not produce misleading sitemap lastmod.
export async function sourceLastmod(
  metadata: { date?: unknown; updated?: unknown },
  filePath?: string,
): Promise<string | undefined> {
  const now = Date.now();
  const dates = [calendarDate(metadata.date), calendarDate(metadata.updated)]
    .filter((date): date is Date => !!date && date.getTime() <= now);
  if (dates.length) {
    return new Date(Math.max(...dates.map(date => date.getTime()))).toISOString().slice(0, 10);
  }
  if (!filePath) return undefined;
  try {
    const info = await stat(filePath);
    return info.isFile() && info.mtimeMs <= Date.now() ? info.mtime.toISOString().slice(0, 10) : undefined;
  } catch (err) {
    if (isENOENT(err)) return undefined;
    throw err;
  }
}

export function latestLastmod(dates: readonly (string | undefined)[]): string | undefined {
  return dates.filter((date): date is string => !!date).sort().at(-1);
}

export async function readPageMetadata(filePath: string) {
  const { data } = matter(await readFile(filePath, "utf8"));
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description = [data.description, data.summary, data.excerpt]
    .find((value): value is string => typeof value === "string" && !!value.trim());
  return { title, description: description || "", lastmod: await sourceLastmod(data, filePath) };
}

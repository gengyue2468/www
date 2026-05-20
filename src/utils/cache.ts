import { stat } from "fs/promises";
import type { RenderedContent, FrontMatter } from "../types.js";

interface RenderCacheEntry {
  mtime: number;
  frontmatter: FrontMatter;
  html: string;
}

class RenderCache {
  private cache = new Map<string, RenderCacheEntry>();

  get(filePath: string, mtime: number): RenderedContent | undefined {
    const entry = this.cache.get(filePath);
    if (entry && entry.mtime === mtime) {
      return { frontmatter: entry.frontmatter, html: entry.html };
    }
    return undefined;
  }

  set(filePath: string, mtime: number, result: RenderedContent): void {
    this.cache.set(filePath, { mtime, frontmatter: result.frontmatter, html: result.html });
  }

  clear(): void {
    this.cache.clear();
  }
}

const renderCache = new RenderCache();

async function getFileMtime(filePath: string): Promise<number | null> {
  try {
    const { mtimeMs } = await stat(filePath);
    return mtimeMs;
  } catch {
    return null;
  }
}

export async function getCachedRender(filePath: string): Promise<RenderedContent | undefined> {
  const mtime = await getFileMtime(filePath);
  if (mtime === null) return undefined;
  return renderCache.get(filePath, mtime);
}

export async function setCachedRender(filePath: string, result: RenderedContent): Promise<void> {
  const mtime = await getFileMtime(filePath);
  if (mtime === null) return;
  renderCache.set(filePath, mtime, result);
}

export function clearContentCache(): void {
  renderCache.clear();
}
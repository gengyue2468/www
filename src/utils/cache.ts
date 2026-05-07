import { stat } from "fs/promises";
import { join } from "path";
import type { DirsConfig, RenderedContent, FrontMatter } from "../types.js";
import { readJsonFile } from "./fs.js";

interface BuildCache {
  pages: Record<string, number>;
  blogPosts: Record<string, number>;
}

const DEFAULT_CACHE: BuildCache = {
  pages: {},
  blogPosts: {},
};

interface RenderCacheEntry {
  mtime: number;
  frontmatter: FrontMatter;
  html: string;
}

class ContentCache {
  private renderCache = new Map<string, RenderCacheEntry>();

  getRender(filePath: string, mtime: number): RenderedContent | undefined {
    const entry = this.renderCache.get(filePath);
    if (entry && entry.mtime === mtime) {
      return { frontmatter: entry.frontmatter, html: entry.html };
    }
    return undefined;
  }

  setRender(filePath: string, mtime: number, result: RenderedContent): void {
    this.renderCache.set(filePath, { mtime, frontmatter: result.frontmatter, html: result.html });
  }

  clear(): void {
    this.renderCache.clear();
  }
}

const contentCache = new ContentCache();

async function getFileMtime(filePath: string): Promise<number | null> {
  try {
    const { mtimeMs } = await stat(filePath);
    return mtimeMs;
  } catch {
    return null;
  }
}

export class BuildCacheManager {
  private cache: BuildCache;
  private cachePath: string;
  private dirty = false;

  constructor(cachePath: string) {
    this.cachePath = cachePath;
    this.cache = { ...DEFAULT_CACHE };
  }

  async load(): Promise<void> {
    const loaded = await readJsonFile<BuildCache>(this.cachePath);
    if (loaded) {
      this.cache = {
        pages: loaded.pages ?? {},
        blogPosts: loaded.blogPosts ?? {},
      };
    } else {
      this.cache = { ...DEFAULT_CACHE };
    }
  }

  async save(): Promise<void> {
    if (!this.dirty) return;
    try {
      await Bun.write(this.cachePath, JSON.stringify(this.cache, null, 2));
    } catch (err) {
      console.warn("Failed to save build cache:", err);
    }
  }

  async hasChanged(store: keyof BuildCache, filePath: string): Promise<boolean> {
    const cached = this.cache[store][filePath];
    if (cached === undefined) return true;
    const mtime = await getFileMtime(filePath);
    return mtime === null || mtime > cached;
  }

  async updateMtime(store: keyof BuildCache, filePath: string): Promise<void> {
    const mtime = await getFileMtime(filePath);
    if (mtime === null) return;
    this.cache[store][filePath] = mtime;
    this.dirty = true;
  }
}

export async function createCacheManager(dirs: DirsConfig): Promise<BuildCacheManager> {
  const cachePath = join(dirs.dist, ".build-cache.json");
  const manager = new BuildCacheManager(cachePath);
  await manager.load();
  return manager;
}

export async function getCachedRender(filePath: string): Promise<RenderedContent | undefined> {
  const mtime = await getFileMtime(filePath);
  if (mtime === null) return undefined;
  return contentCache.getRender(filePath, mtime);
}

export async function setCachedRender(filePath: string, result: RenderedContent): Promise<void> {
  const mtime = await getFileMtime(filePath);
  if (mtime === null) return;
  contentCache.setRender(filePath, mtime, result);
}

export function clearContentCache(): void {
  contentCache.clear();
}

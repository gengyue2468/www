import { stat } from "fs/promises";
import { join } from "path";
import type { DirsConfig, RenderedContent, FrontMatter } from "../types.js";
import { AppError, ErrorCode, isENOENT } from "./errors.js";
import { readJsonFile } from "./fs.js";

interface BuildCache {
  pages: Record<string, number>;
  blogPosts: Record<string, number>;
  layouts: Record<string, number>;
  css: Record<string, number>;
  config: number;
}

const DEFAULT_CACHE: BuildCache = {
  pages: {},
  blogPosts: {},
  layouts: {},
  css: {},
  config: 0,
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
    this.renderCache.set(filePath, {
      mtime,
      frontmatter: result.frontmatter,
      html: result.html,
    });
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
  } catch (err) {
    if (isENOENT(err)) return null;
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { path: filePath });
  }
}

async function hasFileChanged(filePath: string, cachedMtime: number): Promise<boolean> {
  const mtime = await getFileMtime(filePath);
  return mtime === null || mtime > cachedMtime;
}

type CacheStore = "pages" | "blogPosts" | "layouts" | "css";

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
        layouts: loaded.layouts ?? {},
        css: loaded.css ?? {},
        config: loaded.config ?? 0,
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

  async hasChanged(store: CacheStore, key: string, filePath: string): Promise<boolean>;
  async hasChanged(store: "config", _key: string, configPath: string): Promise<boolean>;
  async hasChanged(store: CacheStore | "config", key: string, filePath: string): Promise<boolean> {
    if (store === "config") {
      const cached = this.cache.config;
      return cached === 0 || hasFileChanged(filePath, cached);
    }
    const cached = this.cache[store][key];
    return cached === undefined || hasFileChanged(filePath, cached);
  }

  async updateMtime(store: CacheStore, key: string, filePath: string): Promise<void>;
  async updateMtime(store: "config", _key: string, configPath: string): Promise<void>;
  async updateMtime(store: CacheStore | "config", key: string, filePath: string): Promise<void> {
    const mtime = await getFileMtime(filePath);
    if (mtime === null) return;

    if (store === "config") {
      this.cache.config = mtime;
    } else {
      this.cache[store][key] = mtime;
    }
    this.dirty = true;
  }

  invalidateAll(): void {
    this.cache = { ...DEFAULT_CACHE };
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

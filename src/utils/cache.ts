import { readFile, writeFile, readFileSync } from "fs";
import { stat } from "fs/promises";
import { join, dirname } from "path";
import type { DirsConfig } from "../types.js";

interface BuildCache {
  pages: Record<string, number>;
  blogPosts: Record<string, number>;
  layouts: Record<string, number>;
  config: number;
}

const DEFAULT_CACHE: BuildCache = {
  pages: {},
  blogPosts: {},
  layouts: {},
  config: 0,
};

export class BuildCacheManager {
  private cache: BuildCache;
  private cachePath: string;

  constructor(cachePath: string) {
    this.cachePath = cachePath;
    this.cache = DEFAULT_CACHE;
  }

  load(): BuildCache {
    try {
      const data = readFileSync(this.cachePath, "utf-8");
      this.cache = JSON.parse(data);
    } catch {
      this.cache = { ...DEFAULT_CACHE };
    }
    return this.cache;
  }

  save(): void {
    writeFile(this.cachePath, JSON.stringify(this.cache, null, 2), "utf-8", (err) => {
      if (err) console.warn("Failed to save build cache:", err.message);
    });
  }

  getPageMtime(path: string): number | undefined {
    return this.cache.pages[path];
  }

  setPageMtime(path: string, mtime: number): void {
    this.cache.pages[path] = mtime;
  }

  getBlogPostMtime(slug: string): number | undefined {
    return this.cache.blogPosts[slug];
  }

  setBlogPostMtime(slug: string, mtime: number): void {
    this.cache.blogPosts[slug] = mtime;
  }

  getLayoutMtime(name: string): number | undefined {
    return this.cache.layouts[name];
  }

  setLayoutMtime(name: string, mtime: number): void {
    this.cache.layouts[name] = mtime;
  }

  getConfigMtime(): number {
    return this.cache.config;
  }

  setConfigMtime(mtime: number): void {
    this.cache.config = mtime;
  }
}

export async function createCacheManager(dirs: DirsConfig): Promise<BuildCacheManager> {
  const cachePath = join(dirs.dist, ".build-cache.json");
  const manager = new BuildCacheManager(cachePath);
  manager.load();
  return manager;
}

// Check if a file has changed since last build
export async function hasFileChanged(
  filePath: string,
  cachedMtime: number | undefined
): Promise<boolean> {
  if (cachedMtime === undefined) return true;
  try {
    const { mtimeMs } = await stat(filePath);
    return mtimeMs > cachedMtime;
  } catch {
    return true;
  }
}

import { stat } from "fs/promises";
import { readFileSync } from "fs";
import { join } from "path";
import type { DirsConfig, RenderedContent, FrontMatter } from "../types.js";

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

export class BuildCacheManager {
  private cache: BuildCache;
  private cachePath: string;
  private dirty = false;

  constructor(cachePath: string) {
    this.cachePath = cachePath;
    this.cache = { ...DEFAULT_CACHE };
  }

  load(): void {
    try {
      const data = readFileSync(this.cachePath, "utf-8");
      this.cache = JSON.parse(data) as BuildCache;
    } catch {
      this.cache = { ...DEFAULT_CACHE };
    }
  }

  save(): void {
    if (!this.dirty) return;
    Bun.write(this.cachePath, JSON.stringify(this.cache, null, 2)).catch((err) => {
      console.warn("Failed to save build cache:", err);
    });
  }

  async hasPageChanged(path: string): Promise<boolean> {
    const cached = this.cache.pages[path];
    if (cached === undefined) return true;
    return hasFileChanged(path, cached);
  }

  async hasBlogPostChanged(path: string): Promise<boolean> {
    const cached = this.cache.blogPosts[path];
    if (cached === undefined) return true;
    return hasFileChanged(path, cached);
  }

  async hasLayoutChanged(name: string, layoutPath: string): Promise<boolean> {
    const cached = this.cache.layouts[name];
    if (cached === undefined) return true;
    return hasFileChanged(layoutPath, cached);
  }

  async hasConfigChanged(configPath: string): Promise<boolean> {
    const cached = this.cache.config;
    if (cached === 0) return true;
    return hasFileChanged(configPath, cached);
  }

  async updatePageMtime(path: string): Promise<void> {
    try {
      const { mtimeMs } = await stat(path);
      this.cache.pages[path] = mtimeMs;
      this.dirty = true;
    } catch { /* ignore */ }
  }

  async updateBlogPostMtime(path: string): Promise<void> {
    try {
      const { mtimeMs } = await stat(path);
      this.cache.blogPosts[path] = mtimeMs;
      this.dirty = true;
    } catch { /* ignore */ }
  }

  async updateLayoutMtime(name: string, layoutPath: string): Promise<void> {
    try {
      const { mtimeMs } = await stat(layoutPath);
      this.cache.layouts[name] = mtimeMs;
      this.dirty = true;
    } catch { /* ignore */ }
  }

  async updateConfigMtime(configPath: string): Promise<void> {
    try {
      const { mtimeMs } = await stat(configPath);
      this.cache.config = mtimeMs;
      this.dirty = true;
    } catch { /* ignore */ }
  }

  invalidateAll(): void {
    this.cache = { ...DEFAULT_CACHE };
    this.dirty = true;
  }
}

async function hasFileChanged(
  filePath: string,
  cachedMtime: number
): Promise<boolean> {
  try {
    const { mtimeMs } = await stat(filePath);
    return mtimeMs > cachedMtime;
  } catch {
    return true;
  }
}

export async function createCacheManager(dirs: DirsConfig): Promise<BuildCacheManager> {
  const cachePath = join(dirs.dist, ".build-cache.json");
  const manager = new BuildCacheManager(cachePath);
  manager.load();
  return manager;
}

export async function getCachedRender(filePath: string): Promise<RenderedContent | undefined> {
  try {
    const { mtimeMs } = await stat(filePath);
    return contentCache.getRender(filePath, mtimeMs);
  } catch {
    return undefined;
  }
}

export async function setCachedRender(filePath: string, result: RenderedContent): Promise<void> {
  try {
    const { mtimeMs } = await stat(filePath);
    contentCache.setRender(filePath, mtimeMs, result);
  } catch { /* ignore */ }
}

export function clearContentCache(): void {
  contentCache.clear();
}

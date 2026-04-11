import { stat } from "fs/promises";
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

// In-memory content cache for fast lookups
interface ContentCacheEntry {
  mtime: number;
  content: string;
}

interface RenderCacheEntry {
  mtime: number;
  frontmatter: FrontMatter;
  html: string;
}

class ContentCache {
  private contentCache = new Map<string, ContentCacheEntry>();
  private renderCache = new Map<string, RenderCacheEntry>();

  /**
   * Get cached file content if mtime matches
   */
  getContent(filePath: string, mtime: number): string | undefined {
    const entry = this.contentCache.get(filePath);
    if (entry && entry.mtime === mtime) {
      return entry.content;
    }
    return undefined;
  }

  /**
   * Set cached file content
   */
  setContent(filePath: string, mtime: number, content: string): void {
    this.contentCache.set(filePath, { mtime, content });
  }

  /**
   * Get cached render result if mtime matches
   */
  getRender(filePath: string, mtime: number): RenderedContent | undefined {
    const entry = this.renderCache.get(filePath);
    if (entry && entry.mtime === mtime) {
      return { frontmatter: entry.frontmatter, html: entry.html };
    }
    return undefined;
  }

  /**
   * Set cached render result
   */
  setRender(filePath: string, mtime: number, result: RenderedContent): void {
    this.renderCache.set(filePath, {
      mtime,
      frontmatter: result.frontmatter,
      html: result.html,
    });
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.contentCache.clear();
    this.renderCache.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getStats(): { contentSize: number; renderSize: number } {
    return {
      contentSize: this.contentCache.size,
      renderSize: this.renderCache.size,
    };
  }
}

// Global content cache instance
export const contentCache = new ContentCache();

export class BuildCacheManager {
  private cache: BuildCache;
  private cachePath: string;

  constructor(cachePath: string) {
    this.cachePath = cachePath;
    this.cache = DEFAULT_CACHE;
  }

  load(): BuildCache {
    try {
      const file = Bun.file(this.cachePath);
      const data = file.text();
      this.cache = JSON.parse(data as unknown as string) as BuildCache;
    } catch {
      this.cache = { ...DEFAULT_CACHE };
    }
    return this.cache;
  }

  save(): void {
    Bun.write(this.cachePath, JSON.stringify(this.cache, null, 2)).catch((err) => {
      console.warn("Failed to save build cache:", err);
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

/**
 * Get file content with caching based on mtime
 */
export async function getCachedFileContent(filePath: string): Promise<string> {
  const { mtimeMs } = await stat(filePath);

  // Check in-memory cache
  const cached = contentCache.getContent(filePath, mtimeMs);
  if (cached !== undefined) {
    return cached;
  }

  // Read fresh content
  const file = Bun.file(filePath);
  const content = await file.text();

  // Update cache
  contentCache.setContent(filePath, mtimeMs, content);

  return content;
}

/**
 * Get cached render result if file hasn't changed
 */
export async function getCachedRender(filePath: string): Promise<RenderedContent | undefined> {
  try {
    const { mtimeMs } = await stat(filePath);
    return contentCache.getRender(filePath, mtimeMs);
  } catch {
    return undefined;
  }
}

/**
 * Cache render result for a file
 */
export async function setCachedRender(filePath: string, result: RenderedContent): Promise<void> {
  try {
    const { mtimeMs } = await stat(filePath);
    contentCache.setRender(filePath, mtimeMs, result);
  } catch {
    // Ignore stat errors
  }
}

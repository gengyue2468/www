import { stat } from "fs/promises";
import { join, dirname } from "path";
import type { DirsConfig } from "../types.js";
import { readJsonFile } from "./fs.js";

interface BuildCache {
  md: Record<string, number>;
  config: number;
}

const DEFAULT_CACHE: BuildCache = {
  md: {},
  config: 0,
};

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
      this.cache = { md: loaded.md ?? {}, config: loaded.config ?? 0 };
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

  async hasChanged(filePath: string): Promise<boolean> {
    const cached = this.cache.md[filePath];
    if (cached === undefined) return true;
    const mtime = await getFileMtime(filePath);
    return mtime === null || mtime > cached;
  }

  async hasConfigChanged(configPath: string): Promise<boolean> {
    const cached = this.cache.config;
    if (cached === 0) return true;
    const mtime = await getFileMtime(configPath);
    return mtime === null || mtime > cached;
  }

  async updateMtime(filePath: string): Promise<void> {
    const mtime = await getFileMtime(filePath);
    if (mtime === null) return;
    this.cache.md[filePath] = mtime;
    this.dirty = true;
  }

  async updateConfigMtime(configPath: string): Promise<void> {
    const mtime = await getFileMtime(configPath);
    if (mtime === null) return;
    this.cache.config = mtime;
    this.dirty = true;
  }

  invalidateAll(): void {
    this.cache = { ...DEFAULT_CACHE };
    this.dirty = true;
  }
}

export async function createCacheManager(dirs: DirsConfig): Promise<BuildCacheManager> {
  const rootDir = dirname(dirs.dist);
  const cachePath = join(rootDir, ".build-cache.json");
  const manager = new BuildCacheManager(cachePath);
  await manager.load();
  return manager;
}

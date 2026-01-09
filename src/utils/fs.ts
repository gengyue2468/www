import { mkdir, readdir, stat, copyFile, readFile } from "fs/promises";
import { join } from "path";
import type { DirsConfig } from "../types.js";

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "EEXIST") throw err;
  }
}

/**
 * Recursively copy a directory
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  const entries = await readdir(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stats = await stat(srcPath);

    if (stats.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Copy all files from public directory to dist directory
 */
export async function copyPublicFiles(dirs: DirsConfig): Promise<void> {
  const publicDir = dirs.public;
  const distDir = dirs.dist;

  try {
    const files = await readdir(publicDir);
    for (const file of files) {
      const srcPath = join(publicDir, file);
      const destPath = join(distDir, file);
      const stats = await stat(srcPath);

      if (stats.isDirectory()) {
        await ensureDir(destPath);
        await copyDirectory(srcPath, destPath);
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") {
      console.warn("Public directory not found, skipping...");
    }
  }
}

/**
 * Load a layout template file
 */
export async function loadLayout(
  layoutName: string,
  layoutsDir: string
): Promise<string> {
  try {
    const layoutPath = join(layoutsDir, `${layoutName}.html`);
    return await readFile(layoutPath, "utf-8");
  } catch (err) {
    throw new Error(`Layout ${layoutName}.html not found`);
  }
}


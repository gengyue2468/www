import { mkdir, readdir, stat, copyFile } from "fs/promises";
import { join } from "path";
import type { DirsConfig } from "../types.js";

/**
 * Ensure directory exists using Bun-optimized approach
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
 * Copy directory using parallel I/O for better performance
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await ensureDir(dest);
  const entries = await readdir(src, { withFileTypes: true });

  // Process directories and files in parallel batches
  const dirs: Array<{ src: string; dest: string }> = [];
  const files: Array<{ src: string; dest: string }> = [];

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      dirs.push({ src: srcPath, dest: destPath });
    } else {
      files.push({ src: srcPath, dest: destPath });
    }
  }

  // Copy all files in parallel using Bun's optimized file operations
  await Promise.all(
    files.map(async ({ src: srcPath, dest: destPath }) => {
      const file = Bun.file(srcPath);
      const content = await file.arrayBuffer();
      await Bun.write(destPath, content);
    })
  );

  // Recursively copy directories in parallel
  await Promise.all(dirs.map(({ src: s, dest: d }) => copyDirectory(s, d)));
}

/**
 * Copy public files to dist using parallel processing
 */
export async function copyPublicFiles(dirs: DirsConfig): Promise<void> {
  const { public: publicDir, dist } = dirs;

  try {
    const entries = await readdir(publicDir, { withFileTypes: true });

    // Process directories and files in parallel
    await Promise.all(
      entries.map(async (entry) => {
        const srcPath = join(publicDir, entry.name);
        const destPath = join(dist, entry.name);

        if (entry.isDirectory()) {
          await ensureDir(destPath);
          await copyDirectory(srcPath, destPath);
        } else {
          const file = Bun.file(srcPath);
          const content = await file.arrayBuffer();
          await Bun.write(destPath, content);
        }
      })
    );
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== "ENOENT") {
      console.warn("Public directory not found, skipping...");
    }
  }
}

/**
 * Load layout file using Bun.file() for faster reading
 */
export async function loadLayout(layoutName: string, layoutsDir: string): Promise<string> {
  const layoutPath = join(layoutsDir, `${layoutName}.html`);
  const file = Bun.file(layoutPath);
  return await file.text();
}

/**
 * Fast file content reader using Bun.file()
 */
export async function readFileContent(filePath: string): Promise<string> {
  const file = Bun.file(filePath);
  return await file.text();
}

/**
 * Fast file writer using Bun.write()
 */
export async function writeFileContent(filePath: string, content: string): Promise<void> {
  await Bun.write(filePath, content);
}

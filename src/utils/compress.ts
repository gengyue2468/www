import type { DirsConfig } from "../types.js";

const htmlMinifier = await import("html-minifier");
const CleanCSS = await import("clean-css");

/**
 * Minify HTML content
 */
export function minifyHtml(content: string): string {
  return htmlMinifier.minify(content, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeTagWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
  });
}

/**
 * Minify CSS content
 */
export function minifyCss(content: string): string {
  const result = new CleanCSS.default({}).minify(content);
  return result.styles;
}

/**
 * Compress all HTML files in the dist directory
 */
export async function compressHtmlFiles(dirs: DirsConfig): Promise<void> {
  const { dist } = dirs;
  await compressDirectory(dist, ".html", minifyHtml);
}

/**
 * Compress all CSS files in the dist directory
 */
export async function compressCssFiles(dirs: DirsConfig): Promise<void> {
  const { dist } = dirs;
  await compressDirectory(dist, ".css", minifyCss);
}

/**
 * Recursively compress files with specified extension in a directory
 */
async function compressDirectory(
  dir: string,
  extension: string,
  compressor: (content: string) => string
): Promise<void> {
  const { readdir, stat, readFile, writeFile } = await import("fs/promises");
  const { join } = await import("path");

  const entries = await readdir(dir);

  for (const entry of entries) {
    const path = join(dir, entry);
    const entryStat = await stat(path);

    if (entryStat.isDirectory()) {
      await compressDirectory(path, extension, compressor);
    } else if (entry.endsWith(extension)) {
      const content = await readFile(path, "utf-8");
      const compressed = compressor(content);
      await writeFile(path, compressed, "utf-8");
      console.log(`✓ Compressed ${entry}`);
    }
  }
}

import { join, relative } from "path";
import { watch } from "fs";
import { build } from "./build.js";
import config from "./config.js";

const PORT = 3000;
const DEBOUNCE_MS = 100;

const watchDirs = [
  config.dirs.pages,
  config.dirs.public,
  config.dirs.layouts,
  "./content",
  "./src",
];

let rebuilding = false;
let pending = false;

async function rebuild(): Promise<void> {
  if (rebuilding) {
    pending = true;
    return;
  }
  rebuilding = true;
  try {
    await build();
  } catch {
    console.error("✗ Rebuild failed");
  }
  rebuilding = false;
  if (pending) {
    pending = false;
    rebuild();
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRebuild(changedFile: string): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  const rel = relative(".", changedFile);
  console.log(`\n⚡ Changed: ${rel}`);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    rebuild();
  }, DEBOUNCE_MS);
}

const seen = new Set<string>();

for (const dir of watchDirs) {
  try {
    watch(dir, { recursive: true }, (event, filename) => {
      if (!filename) return;
      const fullPath = join(dir, filename);
      const key = `${event}:${fullPath}`;
      if (seen.has(key)) return;
      seen.add(key);
      setTimeout(() => seen.delete(key), 200);
      if (fullPath.includes("dist") || fullPath.includes("node_modules")) return;
      if (fullPath.endsWith(".map")) return;
      scheduleRebuild(fullPath);
    });
  } catch {
    console.warn(`⚠ Cannot watch ${dir}`);
  }
}

const distDir = config.dirs.dist;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === "/") pathname = "/index.html";
    if (!pathname.includes(".")) pathname += "/index.html";
    const filePath = join(distDir, pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🌐 Serving at http://localhost:${PORT}`);

await build();

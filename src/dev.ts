import { join, relative, resolve, isAbsolute } from "path";
import { watch } from "fs";
import { build } from "./build.js";
import config from "./config.js";

const configuredPort = Number(process.env.PORT || 3000);
if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}
const PORT = configuredPort;
const DEBOUNCE_MS = 100;

const watchDirs = [
  config.dirs.pages,
  config.dirs.public,
  config.dirs.layouts,
  join(config.rootDir, "content"),
  join(config.rootDir, "src"),
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
      const pathParts = fullPath.split(/[\\/]/);
      if (pathParts.includes("node_modules") || pathParts.includes(".git") || pathParts.includes(".obsidian")) return;
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
    let pathname: string;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    const root = resolve(distDir);
    const filePath = resolve(root, `.${pathname}`);
    const relativePath = relative(root, filePath);
    if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
      return new Response("Forbidden", { status: 403 });
    }

    const directFile = Bun.file(filePath);
    if (await directFile.exists()) {
      return new Response(directFile);
    }

    const indexFile = Bun.file(join(filePath, "index.html"));
    if (await indexFile.exists()) {
      return new Response(indexFile);
    }

    const notFoundFile = Bun.file(join(root, "404.html"));
    if (await notFoundFile.exists()) {
      return new Response(notFoundFile, { status: 404 });
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🌐 Serving at http://localhost:${PORT}`);

await rebuild();

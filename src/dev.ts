import { join, relative, resolve, isAbsolute } from "path";
import { watch } from "fs";
import { build, getUnversionedPageAssetPaths } from "./build.js";
import config from "./config.js";
import { getClientScriptDefinitions } from "./extensions/plugin.js";
import { SITE_STYLESHEETS } from "./utils/stylesheets.js";
import { createPreviewFileHandler } from "./utils/preview.js";

const configuredPort = Number(process.env.PORT || 3000);
if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}
const PORT = configuredPort;
const DEBOUNCE_MS = 200;

const watchDirs = [
  config.dirs.public,
  config.dirs.layouts,
  join(config.rootDir, "content"),
];

const publicRoot = resolve(config.dirs.public);
const rebuildFiles = new Set([
  ...SITE_STYLESHEETS.map(file => resolve(join(config.dirs.public, file))),
  ...getClientScriptDefinitions().flatMap(({ sourcePath }) =>
    sourcePath ? [resolve(join(config.dirs.public, sourcePath))] : []
  ),
  resolve(join(config.dirs.public, "fonts", "source-han-serif-cn-vf", "result.css")),
]);

let rebuilding = false;
let pending = false;

async function rebuild(): Promise<void> {
  if (rebuilding) {
    pending = true;
    return;
  }
  rebuilding = true;
  try {
    await build({ development: true });
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

      const absolutePath = resolve(fullPath);
      const publicRelative = relative(publicRoot, absolutePath);
      if (!publicRelative.startsWith("..") && !isAbsolute(publicRelative) && !rebuildFiles.has(absolutePath) && !fullPath.endsWith(".svg")) {
        return;
      }

      scheduleRebuild(fullPath);
    });
  } catch {
    console.warn(`⚠ Cannot watch ${dir}`);
  }
}

const serveFile = createPreviewFileHandler(config.dirs, getUnversionedPageAssetPaths());

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

    if (req.method === "GET" && ["/api/lastfm/now", "/api/lastfm/recent"].includes(pathname)) {
      try {
        const upstream = await fetch(`https://www.gengyue.dev${pathname}`);
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") || "application/json",
            "Cache-Control": "no-store",
          },
        });
      } catch {
        return Response.json({ error: "Last.fm API unavailable" }, { status: 502 });
      }
    }

    return serveFile(pathname);
  },
});

console.log(`🌐 Serving at http://localhost:${PORT}`);

await rebuild();

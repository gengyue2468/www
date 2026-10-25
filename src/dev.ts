import { join, relative, resolve, isAbsolute } from "path";
import { watch } from "fs";
import { getUnversionedPageAssetPaths } from "./build.js";
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

let activeRebuild: Promise<void> | null = null;
let pending = false;
let closing = false;

function rebuild(): Promise<void> {
  if (closing) return Promise.resolve();
  pending = true;
  if (activeRebuild) return activeRebuild;
  activeRebuild = (async () => {
    while (pending && !closing) {
      pending = false;
      try {
        // Fresh imports for every build, without restarting the preview server
        // or interrupting a previous build when source files change again.
        const child = Bun.spawn([process.execPath, join(config.rootDir, "src", "index.ts"), "--development"], {
          cwd: config.rootDir,
          stdin: "ignore",
          stdout: "inherit",
          stderr: "inherit",
        });
        if (await child.exited !== 0) console.error("✗ Rebuild failed; keeping the previous output");
      } catch (err) {
        console.error("✗ Rebuild failed:", err);
      }
    }
  })().finally(() => { activeRebuild = null; });
  return activeRebuild;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRebuild(changedFile: string): void {
  if (closing) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  const rel = relative(".", changedFile);
  console.log(`\n⚡ Changed: ${rel}`);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void rebuild();
  }, DEBOUNCE_MS);
}

const watchers: ReturnType<typeof watch>[] = [];

for (const dir of [...watchDirs, join(config.rootDir, "src")]) {
  try {
    const watcher = watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const fullPath = join(dir, filename);
      const pathParts = fullPath.split(/[\\/]/);
      if (pathParts.includes("node_modules") || pathParts.includes(".git") || pathParts.includes(".obsidian")) return;
      // Ignore editor swap/backup/temp files, especially during atomic saves.
      const name = pathParts.at(-1) || "";
      if (name.startsWith(".") || name === "4913" || /(?:~|\.sw[opx]|\.tmp|\.bak|\.map)$/.test(name)) return;

      const absolutePath = resolve(fullPath);
      const publicRelative = relative(publicRoot, absolutePath);
      if (!publicRelative.startsWith("..") && !isAbsolute(publicRelative) && !rebuildFiles.has(absolutePath) && !/\.(?:svg|js|css)$/.test(fullPath)) {
        return;
      }

      scheduleRebuild(fullPath);
    });
    watchers.push(watcher);
  } catch {
    console.warn(`⚠ Cannot watch ${dir}`);
  }
}

const serveFile = createPreviewFileHandler(config.dirs, getUnversionedPageAssetPaths());

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);
    let pathname: string;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    if (req.method === "GET" && (["/api/spotify/now", "/api/spotify/recent", "/api/lastfm/now", "/api/lastfm/recent", "/api/memos", "/api/memos/calendar", "/api/uptime/status", "/api/beszel", "/api/beszel/events"].includes(pathname) || pathname.startsWith("/api/memos/attachments/"))) {
      if (pathname === "/api/beszel/events") server.timeout(req, 0);
      try {
        const upstream = await fetch(`https://www.gengyue.dev${pathname}${url.search}`, {
          headers: req.headers.has("Range") ? { Range: req.headers.get("Range")! } : {},
          signal: req.signal,
        });
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") || "application/json",
            "Cache-Control": "no-store",
            ...(pathname === "/api/beszel/events" ? { "X-Accel-Buffering": "no" } : {}),
            ...(upstream.headers.has("Retry-After") ? { "Retry-After": upstream.headers.get("Retry-After")! } : {}),
            ...(upstream.headers.has("Content-Range") ? { "Content-Range": upstream.headers.get("Content-Range")! } : {}),
            ...(upstream.headers.has("Accept-Ranges") ? { "Accept-Ranges": upstream.headers.get("Accept-Ranges")! } : {}),
          },
        });
      } catch {
        return Response.json({ error: "Upstream API unavailable" }, { status: 502 });
      }
    }

    return serveFile(pathname);
  },
});

console.log(`🌐 Serving at http://localhost:${PORT}`);

async function shutdown(): Promise<void> {
  if (closing) return;
  closing = true;
  pending = false;
  if (debounceTimer) clearTimeout(debounceTimer);
  for (const watcher of watchers) watcher.close();
  console.log("\nStopping preview; finishing the active build...");
  await Promise.all([server.stop(true), activeRebuild]);
  process.exit(0);
}

process.once("SIGINT", () => { void shutdown(); });
process.once("SIGTERM", () => { void shutdown(); });

await rebuild();

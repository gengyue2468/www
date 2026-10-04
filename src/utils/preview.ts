import { isAbsolute, join, relative, resolve } from "path";

/** Serve final build bytes, never the unminified inputs of generated assets. */
export function createPreviewFileHandler(
  directories: { dist: string; public: string },
  excludedPublicPaths: Iterable<string> = [],
): (pathname: string) => Promise<Response> {
  // Capture live roots: the builder temporarily changes config.dirs.dist to staging.
  const distRoot = resolve(directories.dist);
  const publicRoot = resolve(directories.public);
  const excluded = new Set([...excludedPublicPaths].map(path => path.replaceAll("\\", "/")));
  const headers = { "Cache-Control": "no-store" };

  function containedPath(root: string, pathname: string): string | null {
    const path = resolve(root, `.${pathname}`);
    const local = relative(root, path);
    return local.startsWith("..") || isAbsolute(local) ? null : path;
  }

  return async pathname => {
    if (!pathname.startsWith("/") || pathname.includes("\0")) return new Response("Bad Request", { status: 400, headers });
    const outputPath = containedPath(distRoot, pathname);
    const publicPath = containedPath(publicRoot, pathname);
    if (outputPath === null || publicPath === null) return new Response("Forbidden", { status: 403, headers });

    for (const path of [outputPath, join(outputPath, "index.html")]) {
      const file = Bun.file(path);
      if (await file.exists()) return new Response(file, { headers });
    }

    // Binary files need not be copied on each development rebuild. Text assets
    // already emitted by the build (including SVGs) always win above.
    const publicRelative = relative(publicRoot, publicPath).replaceAll("\\", "/");
    if (!excluded.has(publicRelative)) {
      const file = Bun.file(publicPath);
      if (await file.exists()) return new Response(file, { headers });
    }

    const notFoundFile = Bun.file(join(distRoot, "404.html"));
    return await notFoundFile.exists()
      ? new Response(notFoundFile, { status: 404, headers })
      : new Response("Not Found", { status: 404, headers });
  };
}

import { join } from "path";
import config from "../config.js";
import { AppError, ErrorCode } from "./errors.js";
import { minifyCss } from "./minify.js";

// Preserve the original tufte.css + globals.css cascade order. Splitting the
// sources must not reorder rules or introduce extra stylesheets in the browser.
export const SITE_STYLESHEETS = [
  "css/tufte.css",
  "css/content-blocks.css",
  "css/tokens.css",
  "css/site.css",
  "css/comments.css",
  "css/components.css",
] as const;

export async function loadSiteCss(publicDir = config.dirs.public): Promise<string> {
  const paths = SITE_STYLESHEETS.map(file => join(publicDir, file));
  try {
    const sources = await Promise.all(paths.map(path => Bun.file(path).text()));
    return sources.join("\n");
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, {
      paths,
      phase: "css-asset",
    });
  }
}

export async function getMinifiedCss(publicDir = config.dirs.public): Promise<string> {
  return minifyCss(await loadSiteCss(publicDir), "site.css");
}

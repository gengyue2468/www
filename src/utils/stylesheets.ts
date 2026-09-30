import { join } from "path";
import config from "../config.js";
import { AppError, ErrorCode } from "./errors.js";

// Preserve the original tufte.css + globals.css cascade order. Splitting the
// sources must not reorder rules or introduce extra stylesheets in the browser.
export const SITE_STYLESHEETS = [
  "css/tufte.css",
  "css/content-blocks.css",
  "css/tokens.css",
  "css/site.css",
  "css/comments.css",
] as const;

function deduplicateFontFaces(css: string): string {
  const fontFaceRegex = /@font-face\s*\{[^}]+\}/g;
  const seen = new Set<string>();
  return css.replace(fontFaceRegex, (match) => {
    const key = match.replace(/\s+/g, " ").trim();
    if (seen.has(key)) return "";
    seen.add(key);
    return match;
  });
}

export function lightweightCssMinify(css: string): string {
  return deduplicateFontFaces(css)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s+/gm, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;\}/g, "}")
    .replace(/calc\([^)]+\)/g, (m) => m.replace(/ \+ /g, "§ADD§").replace(/ - /g, "§SUB§"))
    .replace(/\s+/g, " ")
    .replace(/§ADD§/g, " + ")
    .replace(/§SUB§/g, " - ")
    .trim();
}

export async function getMinifiedCss(publicDir = config.dirs.public): Promise<string> {
  const paths = SITE_STYLESHEETS.map(file => join(publicDir, file));
  try {
    const sources = await Promise.all(paths.map(path => Bun.file(path).text()));
    return lightweightCssMinify(sources.join("\n"));
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, {
      paths,
      phase: "css-asset",
    });
  }
}

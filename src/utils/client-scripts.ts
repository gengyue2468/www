import { join } from "path";
import type { ClientScriptDefinition } from "../extensions/plugin.js";
import type { AssetManifest } from "../types.js";
import { readFileContent } from "./fs.js";
import { minifyHtmlTemplateConstant, minifyJavaScript } from "./minify.js";
import { AppError, ErrorCode } from "./errors.js";

export async function loadClientScriptSource(
  definition: ClientScriptDefinition,
  assets: AssetManifest,
  publicDir: string,
  minify = false,
): Promise<string> {
  let source = definition.sourcePath
    ? await readFileContent(join(publicDir, definition.sourcePath))
    : await definition.source!(assets);
  source = definition.transform ? await definition.transform(source, assets) : source;
  if (!minify) return source;
  try {
    for (const name of definition.htmlTemplateConstants || []) {
      source = await minifyHtmlTemplateConstant(source, name);
    }
    return minifyJavaScript(source);
  } catch (err) {
    throw AppError.fromError(err, ErrorCode.BUILD_ERROR, { key: definition.key, sourcePath: definition.sourcePath });
  }
}

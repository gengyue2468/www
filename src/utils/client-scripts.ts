import { join } from "path";
import type { ClientScriptDefinition } from "../extensions/plugin.js";
import type { AssetManifest } from "../types.js";
import { readFileContent } from "./fs.js";

export async function loadClientScriptSource(
  definition: ClientScriptDefinition,
  assets: AssetManifest,
  publicDir: string,
): Promise<string> {
  const source = definition.sourcePath
    ? await readFileContent(join(publicDir, definition.sourcePath))
    : await definition.source!(assets);
  return definition.transform ? definition.transform(source, assets) : source;
}

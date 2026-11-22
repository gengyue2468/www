import { dirname, join, resolve } from "path";
import config from "../config.js";

/** Bundle browser component modules from components/ without leaving unhashed runtime imports. */
export async function bundleClientScript(source: string, sourcePath: string, componentsDir = config.dirs.components): Promise<string> {
  const entryPath = resolve(join(componentsDir, sourcePath));
  const resolveDir = dirname(entryPath);
  const result = await Bun.build({
    entrypoints: [entryPath],
    target: "browser",
    format: "esm",
    minify: { whitespace: false, identifiers: false, syntax: true },
    plugins: [{ name: "client-source", setup(build) {
      build.onLoad({ filter: /\.js$/ }, args => {
        if (resolve(args.path) === entryPath) return { contents: source, loader: "js", resolveDir };
        return undefined;
      });
    } }],
  });
  if (!result.success) throw new AggregateError(result.logs, `Could not bundle ${sourcePath}`);
  return result.outputs[0].text();
}

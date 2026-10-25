import { join } from "path";

/** Bundle local browser modules without leaving unhashed runtime imports. */
export async function bundleClientScript(source: string, fileName: string): Promise<string> {
  const directory = join(import.meta.dir, "../../public/js");
  const result = await Bun.build({
    entrypoints: [join(directory, fileName)],
    target: "browser",
    format: "esm",
    plugins: [{ name: "client-source", setup(build) {
      build.onLoad({ filter: /\.js$/ }, args => {
        if (args.path === join(directory, fileName)) return { contents: source, loader: "js", resolveDir: directory };
        return undefined;
      });
    } }],
  });
  if (!result.success) throw new AggregateError(result.logs, `Could not bundle ${fileName}`);
  return result.outputs[0].text();
}

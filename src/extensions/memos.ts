import { join } from "path";
import type { Plugin } from "./plugin.js";

export const memosPlugin: Plugin = {
  name: "memos-feed",
  webComponents: [{ tagName: "memos-feed", scriptKey: "memos-feed" }],
  clientScripts: [{
    key: "memos-feed",
    fileName: "memos-feed",
    sourcePath: "js/memos.js",
    async transform(source) {
      // Reuse the installed Markdown parser, bundled only into this page's asset.
      // Raw HTML stays disabled; no remote scripts or CDN runtime are required.
      const directory = join(import.meta.dir, "../../public/js");
      const result = await Bun.build({
        entrypoints: [join(directory, "memos.js")],
        target: "browser",
        format: "esm",
        plugins: [{ name: "memos-client-source", setup(build) {
          build.onLoad({ filter: /[\\/]memos\.js$/ }, () => ({ contents: source, loader: "js", resolveDir: directory }));
        } }],
      });
      if (!result.success) throw new AggregateError(result.logs, "Could not bundle the memos client");
      return result.outputs[0].text();
    },
  }],
};

import { join } from "path";
import type { Plugin } from "./plugin.js";
import { minifyHtmlTemplateConstant } from "../utils/minify.js";

export const speedtestPlugin: Plugin = {
  name: "speedtest-page",
  webComponents: [{ tagName: "speedtest-page", scriptKey: "speedtest-page" }],
  clientScripts: [{
    key: "speedtest-page",
    fileName: "speedtest-page",
    sourcePath: "js/speedtest.js",
    async transform(source) {
      source = await minifyHtmlTemplateConstant(source, "SPEEDTEST_CONTROLS");
      const directory = join(import.meta.dir, "../../public/js");
      const result = await Bun.build({
        entrypoints: [join(directory, "speedtest.js")],
        target: "browser",
        format: "esm",
        plugins: [{ name: "speedtest-client-source", setup(build) {
          build.onLoad({ filter: /[\\/]speedtest\.js$/ }, () => ({ contents: source, loader: "js", resolveDir: directory }));
        } }],
      });
      if (!result.success) throw new AggregateError(result.logs, "Could not bundle the speedtest client");
      return result.outputs[0].text();
    },
  }],
};

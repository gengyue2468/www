import type { Plugin } from "./plugin.js";
import { bundleClientScript } from "../utils/bundle-client.js";
import { minifyHtmlTemplateConstant } from "../utils/minify.js";

export const speedtestPlugin: Plugin = {
  name: "speedtest-page",
  webComponents: [{ tagName: "speedtest-page", scriptKey: "speedtest-page" }],
  clientScripts: [{
    key: "speedtest-page",
    fileName: "speedtest-page",
    sourcePath: "pages/speedtest/index.js",
    async transform(source) {
      return bundleClientScript(await minifyHtmlTemplateConstant(source, "SPEEDTEST_CONTROLS"), "pages/speedtest/index.js");
    },
  }],
};

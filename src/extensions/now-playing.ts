import type { Plugin } from "./plugin.js";
import { bundleClientScript } from "../utils/bundle-client.js";
import { minifyHtmlTemplateConstant } from "../utils/minify.js";

export const nowPlayingPlugin: Plugin = {
  name: "now-playing-card",
  clientScripts: [{
    key: "now-playing-card",
    fileName: "now-playing-card",
    sourcePath: "js/now-playing.js",
    async transform(source) {
      return bundleClientScript(await minifyHtmlTemplateConstant(source, "COMPONENT_TEMPLATE"), "now-playing.js");
    },
  }],
  webComponents: [{
    tagName: "now-playing-card",
    scriptKey: "now-playing-card",
  }],
};

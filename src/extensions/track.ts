import type { Plugin } from "./plugin.js";
import { bundleClientScript } from "../utils/bundle-client.js";

export const trackPlugin: Plugin = {
  name: "track-page",
  webComponents: [{ tagName: "track-page", scriptKey: "track-page" }],
  clientScripts: [{
    key: "track-page",
    fileName: "track-page",
    sourcePath: "pages/track/index.js",
    transform: source => bundleClientScript(source, "pages/track/index.js"),
  }],
};

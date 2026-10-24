import type { Plugin } from "./plugin.js";

export const trackPlugin: Plugin = {
  name: "track-page",
  webComponents: [{ tagName: "track-page", scriptKey: "track-page" }],
  clientScripts: [{
    key: "track-page",
    fileName: "track-page",
    sourcePath: "js/track.js",
  }],
};

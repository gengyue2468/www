import type { Plugin } from "./plugin.js";

export const nowPlayingPlugin: Plugin = {
  name: "now-playing-card",
  clientScripts: [{
    key: "now-playing-card",
    fileName: "now-playing-card",
    sourcePath: "js/now-playing.js",
  }],
  webComponents: [{
    tagName: "now-playing-card",
    scriptKey: "now-playing-card",
  }],
};

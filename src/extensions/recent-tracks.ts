import type { Plugin } from "./plugin.js";

export const recentTracksPlugin: Plugin = {
  name: "recent-tracks",
  clientScripts: [{
    key: "recent-tracks",
    fileName: "recent-tracks",
    sourcePath: "js/recent-tracks.js",
  }],
  webComponents: [{
    tagName: "recent-tracks-loader",
    scriptKey: "recent-tracks",
  }],
};

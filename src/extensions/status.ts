import type { Plugin } from "./plugin.js";

export const statusPlugin: Plugin = {
  name: "status-page",
  webComponents: [{ tagName: "status-page", scriptKey: "status-page" }],
  clientScripts: [{
    key: "status-page",
    fileName: "status-page",
    sourcePath: "js/status.js",
  }],
};

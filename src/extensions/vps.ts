import type { Plugin } from "./plugin.js";

export const vpsPlugin: Plugin = {
  name: "vps-page",
  webComponents: [{ tagName: "vps-page", scriptKey: "vps-page" }],
  clientScripts: [{ key: "vps-page", fileName: "vps-page", sourcePath: "js/vps.js" }],
};

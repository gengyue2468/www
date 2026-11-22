import type { Plugin } from "./plugin.js";

export const dialogPlugin: Plugin = {
  name: "site-dialog",
  webComponents: [{ tagName: "site-dialog", scriptKey: "site-dialog" }],
  clientScripts: [{ key: "site-dialog", fileName: "site-dialog", sourcePath: "ui/site-dialog.js" }],
};

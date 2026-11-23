import type { Plugin } from "./plugin.js";

export const toastPlugin: Plugin = {
  name: "site-toast",
  webComponents: [{ tagName: "site-toast", scriptKey: "site-toast" }],
  clientScripts: [{ key: "site-toast", fileName: "site-toast", sourcePath: "ui/site-toast.js" }],
};

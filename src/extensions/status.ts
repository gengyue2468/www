import type { Plugin } from "./plugin.js";
import { bundleClientScript } from "../utils/bundle-client.js";

export const statusPlugin: Plugin = {
  name: "status-page",
  webComponents: [{ tagName: "status-page", scriptKey: "status-page" }],
  clientScripts: [{
    key: "status-page",
    fileName: "status-page",
    sourcePath: "pages/status/index.js",
    transform: source => bundleClientScript(source, "pages/status/index.js"),
  }],
};

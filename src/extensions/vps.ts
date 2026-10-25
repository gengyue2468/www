import type { Plugin } from "./plugin.js";
import { bundleClientScript } from "../utils/bundle-client.js";

export const vpsPlugin: Plugin = {
  name: "vps-page",
  webComponents: [{ tagName: "vps-page", scriptKey: "vps-page" }],
  clientScripts: [{ key: "vps-page", fileName: "vps-page", sourcePath: "js/vps.js", transform: source => bundleClientScript(source, "vps.js") }],
};

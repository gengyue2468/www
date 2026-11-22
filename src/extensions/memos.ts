import type { Plugin } from "./plugin.js";
import { bundleClientScript } from "../utils/bundle-client.js";

export const memosPlugin: Plugin = {
  name: "memos-feed",
  webComponents: [{ tagName: "memos-feed", scriptKey: "memos-feed" }],
  clientScripts: [{
    key: "memos-feed",
    fileName: "memos-feed",
    sourcePath: "pages/memos/index.js",
    transform: source => bundleClientScript(source, "pages/memos/index.js"),
  }],
};

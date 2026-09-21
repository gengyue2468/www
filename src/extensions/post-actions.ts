import type { Plugin } from "./plugin.js";

const COMPONENT_TAG = "post-actions";

export const postActionsPlugin: Plugin = {
  name: "post-actions",
  clientScripts: [{
    key: "post-actions",
    fileName: "post-actions",
    sourcePath: "js/post-actions.js",
  }],
  webComponents: [{
    tagName: COMPONENT_TAG,
    scriptKey: "post-actions",
  }],
};

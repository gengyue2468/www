import type { Plugin } from "./plugin.js";

const COMPONENT_TAG = "isso-comments";

export const commentsPlugin: Plugin = {
  name: "isso-comments",
  clientScripts: [{
    key: "isso-comments",
    fileName: "isso-comments",
    sourcePath: "js/comments.js",
  }],
  webComponents: [{
    tagName: COMPONENT_TAG,
    scriptKey: "isso-comments",
  }],
};

import type { Plugin } from "./plugin.js";

const COMPONENT_TAG = "post-actions";

export function postActionsScript(src: string): string {
  return `<script defer src="${src}"></script>`;
}

export const postActionsPlugin: Plugin = {
  name: "post-actions",
  webComponents: [{
    tagName: COMPONENT_TAG,
    script: assets => postActionsScript(assets.postActionsScriptSrc),
  }],
};

import type { Plugin } from "./plugin.js";

export const listCollapsePlugin: Plugin = {
  name: "list-collapse",
  containers: [{
    type: "list",
    validate(params) {
      const match = params.trim().match(/^list\s+(0|[1-9]\d*)$/);
      return match && Number.isSafeInteger(Number(match[1])) ? match : null;
    },
    render(tokens, idx) {
      if (tokens[idx].nesting === -1) return "</list-collapse>\n";
      const limit = Number(tokens[idx].info.trim().split(/\s+/)[1]);
      return `<list-collapse limit="${limit}">\n`;
    },
  }],
  webComponents: [{ tagName: "list-collapse", scriptKey: "list-collapse" }],
  clientScripts: [{ key: "list-collapse", fileName: "list-collapse", sourcePath: "js/list-collapse.js" }],
};

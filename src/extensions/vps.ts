import type { Plugin } from "./plugin.js";
import { bundleClientScript } from "../utils/bundle-client.js";
import { readFileContent } from "../utils/fs.js";
import { minifyCss } from "../utils/minify.js";
import { join } from "path";

export const vpsPlugin: Plugin = {
  name: "vps-page",
  webComponents: [{ tagName: "vps-page", scriptKey: "vps-page" }],
  clientScripts: [{ key: "vps-page", fileName: "vps-page", sourcePath: "js/vps.js", transform: source => bundleClientScript(source, "vps.js") }],
  hooks: {
    async afterRenderPage(route, html) {
      if (route !== "/vps") return html;
      const css = await readFileContent(join(import.meta.dir, "../../public/css/vps-fonts.css"));
      return html.replace("</head>", `<style data-vps-fonts>${minifyCss(css, "vps-fonts.css")}</style></head>`);
    },
  },
};

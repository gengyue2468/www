import type { Plugin } from "./plugin.js";

const COMPONENT_TAG = "sidenote-connectors";

export function hasSidenoteConnectors(html: string): boolean {
  return html.includes('class="note-connector-source"');
}

export function addSidenoteConnector(html: string): string {
  return hasSidenoteConnectors(html)
    ? `${html}<${COMPONENT_TAG}></${COMPONENT_TAG}>`
    : html;
}

export const sidenotePlugin: Plugin = {
  name: "sidenote-connectors",
  clientScripts: [{
    key: "sidenote-connectors",
    fileName: "sidenote-connectors",
    sourcePath: "js/sidenote-connectors.js",
  }],
  webComponents: [{
    tagName: COMPONENT_TAG,
    scriptKey: "sidenote-connectors",
  }],
};

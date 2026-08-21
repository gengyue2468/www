export function hasSidenoteConnectors(html: string): boolean {
  return html.includes('class="note-connector-source"');
}

export const sidenoteScript = '<script defer src="/js/sidenote-connectors.js"></script>';

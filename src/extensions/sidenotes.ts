export function hasSidenoteConnectors(html: string): boolean {
  return html.includes('class="note-connector-source"');
}

export function sidenoteScript(src: string): string {
  return `<script defer src="${src}"></script>`;
}

export function hasMathHtml(html: string): boolean {
  return /class="katex(?:\s|"|-)/.test(html);
}

export function mathStylesheet(href: string): string {
  return `<link rel="stylesheet" href="${href}" />`;
}

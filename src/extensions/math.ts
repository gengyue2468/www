export function hasMathHtml(html: string): boolean {
  return /class="katex(?:\s|"|-)/.test(html);
}

export const mathStylesheet = '<link rel="stylesheet" href="/katex/katex.min.css" />';

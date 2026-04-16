const TEMPLATE_REGEX_CACHE = new Map<string, RegExp>();

function getTemplateRegex(key: string): RegExp {
  let regex = TEMPLATE_REGEX_CACHE.get(key);
  if (!regex) {
    regex = new RegExp(`{{${key}}}`, "g");
    TEMPLATE_REGEX_CACHE.set(key, regex);
  }
  return regex;
}

export function renderTemplate(
  template: string,
  data: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = getTemplateRegex(key);
    result = result.replace(regex, value);
  }
  return result;
}

export function renderNav(navItems: { name: string; path: string; show: boolean }[]): string {
  const parts: string[] = [];
  for (const item of navItems) {
    if (item.show) {
      parts.push(`<a href="${item.path}">${item.name}</a>`);
    }
  }
  return parts.join("\n      ");
}

export function clearTemplateCache(): void {
  TEMPLATE_REGEX_CACHE.clear();
}

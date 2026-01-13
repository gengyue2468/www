export function renderTemplate(
  template: string,
  data: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

export function renderNav(navItems: { name: string; path: string; show: boolean }[]): string {
  return navItems
    .filter((item) => item.show)
    .map((item) => `<a href="${item.path}">${item.name}</a>`)
    .join("\n      ");
}


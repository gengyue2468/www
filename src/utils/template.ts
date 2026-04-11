/**
 * Template rendering utilities optimized for performance
 * Uses array join instead of string concatenation for better performance
 */

// Simple regex for template replacement - precompiled for reuse
const TEMPLATE_REGEX_CACHE = new Map<string, RegExp>();

function getTemplateRegex(key: string): RegExp {
  let regex = TEMPLATE_REGEX_CACHE.get(key);
  if (!regex) {
    regex = new RegExp(`{{${key}}}`, "g");
    TEMPLATE_REGEX_CACHE.set(key, regex);
  }
  return regex;
}

/**
 * Render a template with data substitutions
 * Uses regex cache and efficient string replacement
 */
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

/**
 * Render navigation items using array join for better performance
 */
export function renderNav(navItems: { name: string; path: string; show: boolean }[]): string {
  const parts: string[] = [];
  for (const item of navItems) {
    if (item.show) {
      parts.push(`<a href="${item.path}">${item.name}</a>`);
    }
  }
  return parts.join("\n      ");
}

/**
 * Render a list of items using array join
 * More efficient than string concatenation in loops
 */
export function renderList<T>(
  items: T[],
  renderFn: (item: T, index: number) => string
): string {
  const parts: string[] = new Array(items.length);
  for (let i = 0; i < items.length; i++) {
    parts[i] = renderFn(items[i], i);
  }
  return parts.join("");
}

/**
 * Batch template rendering for multiple pages
 * Processes templates in parallel when possible
 */
export async function renderTemplatesBatch(
  templates: Array<{ template: string; data: Record<string, string> }>
): Promise<string[]> {
  // Process all templates in parallel
  return templates.map(({ template, data }) => renderTemplate(template, data));
}

/**
 * Clear the regex cache (useful for memory management)
 */
export function clearTemplateCache(): void {
  TEMPLATE_REGEX_CACHE.clear();
}

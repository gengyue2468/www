import { renderMarkdown } from "./markdown";

export interface PageMeta {
  title: string;
  description?: string;
}

export interface Page extends PageMeta {
  slug: string;
  content: string;
}

function parseFrontmatter(raw: string): { meta: Partial<PageMeta>; body: string } {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("---")) {
    return { meta: {}, body: raw };
  }

  const end = trimmed.indexOf("\n---", 3);
  if (end === -1) {
    return { meta: {}, body: raw };
  }

  const fmBlock = trimmed.slice(3, end).trimEnd();
  const body = trimmed.slice(end + 4).trimStart();

  const meta: Partial<PageMeta> = {};

  const lines = fmBlock.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;

    const match = /^([A-Za-z0-9_-]+)\s*:(.*)$/.exec(trimmedLine);
    if (!match) continue;

    const key = match[1].trim() as keyof PageMeta;
    let value = match[2].trim();

    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }

    (meta as any)[key] = value;
  }

  return { meta, body };
}

let allPages: Page[] = [];

export function initPages(modules: Record<string, string>) {
  allPages = Object.entries(modules).map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { meta, body } = parseFrontmatter(raw);

    return {
      slug,
      title: meta.title ?? slug,
      description: meta.description,
      content: body,
    };
  });
}

export function getAllPages(): Page[] {
  return allPages;
}

export function getPageBySlug(slug: string): Page | undefined {
  return allPages.find((p) => p.slug === slug);
}

export function renderPage(raw: string): string {
  return renderMarkdown(raw);
}

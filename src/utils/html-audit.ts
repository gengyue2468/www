import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { htmlToPlainText } from "./seo.js";

export type HtmlAuditIssueKind =
  | "duplicate-id"
  | "broken-local-link"
  | "broken-fragment"
  | "missing-title"
  | "missing-image-alt"
  | "heading-hierarchy";

export interface HtmlAuditIssue {
  kind: HtmlAuditIssueKind;
  file: string;
  message: string;
}

interface Reference {
  tag: string;
  attribute: "href" | "src";
  value: string;
  checkFragment: boolean;
}

interface DocumentInfo {
  file: string;
  route: string;
  ids: Set<string>;
  references: Reference[];
  issues: HtmlAuditIssue[];
}

function issue(kind: HtmlAuditIssueKind, file: string, message: string): HtmlAuditIssue {
  return { kind, file, message };
}

function routeFromFile(file: string): string {
  const normalized = file.replaceAll("\\", "/");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) return `/${normalized.slice(0, -"/index.html".length)}`;
  return `/${normalized}`;
}

function documentBase(route: string): string {
  if (route === "/" || route.endsWith("/")) return route;
  return /\.[^/]+$/.test(route) ? route : `${route}/`;
}

function localPath(value: string, route: string): URL | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) return null;

  try {
    return new URL(trimmed, `https://html-audit.invalid${documentBase(route)}`);
  } catch {
    return null;
  }
}

function decodePathname(pathname: string): string | null {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

function findOutputFile(pathname: string, files: Set<string>): string | null {
  const decoded = decodePathname(pathname);
  if (decoded === null || decoded.includes("\0")) return null;

  const cleanPath = decoded.replace(/^\/+/, "");
  if (!cleanPath) return files.has("index.html") ? "index.html" : null;

  const candidates = cleanPath.endsWith("/")
    ? [`${cleanPath}index.html`]
    : [cleanPath, `${cleanPath}/index.html`];
  return candidates.find(candidate => files.has(candidate)) || null;
}

function inspectDocument(html: string, file: string): DocumentInfo {
  const route = routeFromFile(file);
  const ids = new Set<string>();
  const references: Reference[] = [];
  const issues: HtmlAuditIssue[] = [];
  const headingLevels: number[] = [];

  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch || !htmlToPlainText(titleMatch[1]).trim()) {
    issues.push(issue("missing-title", file, "document has no non-empty <title>"));
  }

  const rewriter = new HTMLRewriter();
  rewriter.on("*", {
    element(element) {
      const tag = element.tagName.toLowerCase();
      const id = element.getAttribute("id");
      if (id !== null) {
        if (ids.has(id)) {
          issues.push(issue("duplicate-id", file, `duplicate id '${id}'`));
        }
        ids.add(id);
      }

      const heading = tag.match(/^h([1-6])$/);
      if (heading) headingLevels.push(Number(heading[1]));

      if (tag === "img" && element.getAttribute("alt") === null) {
        issues.push(issue("missing-image-alt", file, "<img> is missing an alt attribute"));
      }

      if (tag === "a") {
        const href = element.getAttribute("href");
        if (href !== null) references.push({ tag, attribute: "href", value: href, checkFragment: true });
      } else if (tag === "img" || tag === "script" || tag === "iframe") {
        const src = element.getAttribute("src");
        if (src !== null) references.push({ tag, attribute: "src", value: src, checkFragment: false });
      } else if (tag === "link") {
        const href = element.getAttribute("href");
        if (href !== null) references.push({ tag, attribute: "href", value: href, checkFragment: false });
      }
    },
  });
  rewriter.transform(html);

  for (let index = 1; index < headingLevels.length; index++) {
    const previous = headingLevels[index - 1];
    const current = headingLevels[index];
    if (previous >= 2 && current > previous + 1) {
      issues.push(issue("heading-hierarchy", file, `heading level jumps from h${previous} to h${current}`));
    }
  }

  return { file, route, ids, references, issues };
}

export function auditHtmlDocument(html: string, file = "index.html"): HtmlAuditIssue[] {
  return inspectDocument(html, file).issues;
}

function auditReferences(documents: DocumentInfo[], files: Set<string>): HtmlAuditIssue[] {
  const issues: HtmlAuditIssue[] = [];
  const documentsByFile = new Map(documents.map(document => [document.file, document]));

  for (const document of documents) {
    for (const reference of document.references) {
      const target = localPath(reference.value, document.route);
      if (!target) continue;

      const targetFile = findOutputFile(target.pathname, files);
      if (!targetFile) {
        issues.push(issue("broken-local-link", document.file, `${reference.tag}[${reference.attribute}] points to missing '${reference.value}'`));
        continue;
      }

      if (!reference.checkFragment || !target.hash) continue;
      const targetDocument = documentsByFile.get(targetFile);
      if (!targetDocument) continue;

      let fragment: string;
      try {
        fragment = decodeURIComponent(target.hash.slice(1));
      } catch {
        fragment = target.hash.slice(1);
      }
      if (fragment && !targetDocument.ids.has(fragment)) {
        issues.push(issue("broken-fragment", document.file, `${reference.tag}[href] points to missing '#${fragment}' in '${targetFile}'`));
      }
    }
  }

  return issues;
}

async function collectHtmlFiles(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const filePath = join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(root, filePath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(relative(root, filePath).replaceAll("\\", "/"));
    }
  }
  return files;
}

export async function auditDist(distDir: string): Promise<HtmlAuditIssue[]> {
  const htmlFiles = await collectHtmlFiles(distDir);
  const documents = await Promise.all(htmlFiles.map(async file => {
    const html = await Bun.file(join(distDir, file)).text();
    return inspectDocument(html, file);
  }));
  const files = new Set<string>();
  const allFiles = await collectAllFiles(distDir);
  for (const file of allFiles) files.add(file);

  return [...documents.flatMap(document => document.issues), ...auditReferences(documents, files)];
}

async function collectAllFiles(root: string, current = root): Promise<string[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const filePath = join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectAllFiles(root, filePath));
    } else if (entry.isFile()) {
      files.push(relative(root, filePath).replaceAll("\\", "/"));
    }
  }
  return files;
}

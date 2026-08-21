export function cleanBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function joinUrlPath(...segments: string[]): string {
  return `/${segments.map(segment => encodeURIComponent(segment)).join("/")}`;
}

export function assertSafePathSegment(value: string, label: string): void {
  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
  if (!value || value === "." || value === ".." || /[\\/\u0000-\u001f]/.test(value)) {
    throw new Error(`${label} contains an unsafe path segment: ${JSON.stringify(value)}`);
  }
  if (/[. ]$/.test(value) || reserved.test(value)) {
    throw new Error(`${label} is not valid on Windows: ${JSON.stringify(value)}`);
  }
}

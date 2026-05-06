export function cleanBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

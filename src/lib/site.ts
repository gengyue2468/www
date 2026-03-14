export const SITE_NAME = "gengyue";
export const SITE_URL = "https://www.gengyue.site";
export const DEFAULT_DESCRIPTION =
  "gengyue 的个人网站，记录技术探索、项目实践与学习笔记。";
export const DEFAULT_IMAGE = "/static/og/og-image.webp";
export const PERSON_NAME = "gengyue";
export const PERSON_GITHUB = "https://github.com/gengyue2468";

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${normalized}`;
}
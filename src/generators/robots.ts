import { join } from "path";
import { writeFileContent } from "../utils/fs.js";
import { cleanBaseUrl } from "../utils/url.js";
import config from "../config.js";

export async function generateRobotsTxt(): Promise<void> {
  if (!config.robots.enabled) return;

  const lines: string[] = [];
  const { userAgent, allow, disallow, crawlDelay } = config.robots;

  lines.push(`User-agent: ${userAgent}`);

  const allowRules = allow.length > 0 ? allow : ["/"];
  for (const rule of allowRules) {
    lines.push(`Allow: ${rule}`);
  }

  for (const rule of disallow) {
    lines.push(`Disallow: ${rule}`);
  }

  if (crawlDelay && crawlDelay > 0) {
    lines.push(`Crawl-delay: ${crawlDelay}`);
  }

  if (config.sitemap.enabled) {
    const sitemapUrl = `${cleanBaseUrl(config.site.url)}/sitemap.xml`;
    lines.push(`Sitemap: ${sitemapUrl}`);
  }

  const robotsPath = join(config.dirs.dist, "robots.txt");
  await writeFileContent(robotsPath, lines.join("\n") + "\n");
  console.log(`✓ Generated robots.txt -> ${robotsPath}`);
}

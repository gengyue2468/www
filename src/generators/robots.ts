import { join } from "path";
import generateRobotstxt from "generate-robotstxt";
import { writeFileContent } from "../utils/fs.js";
import config from "../config.js";

/**
 * Generate robots.txt using optimized file writing
 */
export async function generateRobotsTxt(): Promise<void> {
  if (!config.robots.enabled) return;

  const siteUrl = config.site.url;

  const robotsConfig = {
    policy: [
      {
        userAgent: config.robots.userAgent,
        allow: config.robots.allow.length > 0 ? config.robots.allow : "/",
        disallow: config.robots.disallow.length > 0 ? config.robots.disallow : [],
      },
    ],
    sitemap: config.sitemap.enabled ? `${siteUrl.replace(/\/$/, "")}/sitemap.xml` : undefined,
  };

  const robotsTxt = await generateRobotstxt(robotsConfig);

  const robotsPath = join(config.dirs.dist, "robots.txt");
  await writeFileContent(robotsPath, robotsTxt);
  console.log(`✓ Generated robots.txt -> ${robotsPath}`);
}

import { join } from "path";
import { writeFile } from "fs/promises";
import generateRobotstxt from "generate-robotstxt";
import config from "../config.js";

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
  await writeFile(robotsPath, robotsTxt, "utf-8");
  console.log(`✓ Generated robots.txt -> ${robotsPath}`);
}

declare module "generate-robotstxt" {
  export interface RobotsPolicy {
    userAgent: string;
    allow?: string | string[];
    disallow?: string | string[];
    crawlDelay?: number;
  }

  export interface RobotsConfig {
    policy: RobotsPolicy[];
    sitemap?: string;
    host?: string;
  }

  export default function generateRobotstxt(
    config: RobotsConfig
  ): Promise<string>;
}


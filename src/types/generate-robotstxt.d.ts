declare module 'generate-robotstxt' {
  interface RobotsOptions {
    policy?: Array<{
      userAgent?: string;
      allow?: string | string[];
      disallow?: string | string[];
    }>;
    sitemap?: string;
    host?: string;
  }

  function generateRobotstxt(options?: RobotsOptions): Promise<string>;
  export = generateRobotstxt;
}

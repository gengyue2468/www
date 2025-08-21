require('dotenv').config();

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,  // 现在可以读取了
  generateRobotsTxt: true,
  sitemapSize: 7000,
  additionalPaths: async (config) => {
    const paths = [];
    const staticPages = ["/design", "/now", "/whims"];
    staticPages.forEach((path) => {
      paths.push({
        loc: path,
        lastmod: new Date().toISOString(),
      });
    });
    return paths;
  },
};
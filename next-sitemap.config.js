module.exports = {
  siteUrl: "https://bg.huster.fun",
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
    // 动态路由逻辑...
    return paths;
  },
};

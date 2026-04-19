import type { Config } from "./types.js";

const config: Config = {
  site: {
    title: "gengyue",
    author: "gengyue",
    description:
      "gengyue 的个人网站与博客 - 华中科技大学计算机专业学生，记录技术探索、开发经验与项目实践。分享技术、开发等文章，以及开源项目和小玩具建设经验。",
    url: "https://www.gengyue.site",
    ogImage: "/static/og/og-image.webp",
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: "gengyue - 个人网站与博客",
  },

  dirs: {
    pages: "./src/content/pages",
    public: "./public",
    dist: "./dist",
    layouts: "./layouts",
  },

  routes: {
    "/": "index.md",
    "/about": "about.md",
  },

  collections: [
    {
      name: "blog",
      srcDir: "./src/content/blog",
      urlPrefix: "blog",
      tags: true,
      layouts: {
        index: "blog-index",
        post: "blog-post",
        tags: "tags",
      },
    },
    {
      name: "logbook",
      srcDir: "./src/content/logbook",
      urlPrefix: "logbook",
      tags: false,
      layouts: {
        index: "blog-index",
        post: "blog-post",
      },
    },
  ],

  date: {
    locale: "zh-CN",
    options: {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  },

  styles: {},

  placeholders: {
    sidenote: "SNOTE",
    marginnote: "MNOTE",
    fold: "FOLD",
  },

  analytics: {
    enabled: true,
    scriptUrl: "https://umami.gengyue.site/script.js",
    websiteId: "365406e1-29dc-44b9-895d-ff41a1e21ae1",
  },

  rss: {
    enabled: true,
    title: "gengyue's blog",
    description: "The personal blog of gengyue.",
    language: "zh-CN",
    copyright: "Copyright © 2026 gengyue",
    items: { limit: 200 },
  },

  sitemap: {
    enabled: true,
    changefreq: "weekly",
    priority: { home: 1.0, pages: 0.8, blog: 0.9, posts: 0.7 },
  },

  robots: {
    enabled: true,
    userAgent: "*",
    allow: ["/"],
    disallow: ["/*.md", "/blog/tag/", "/logbook/tag/"],
    crawlDelay: 0,
  },

  llms: {
    enabled: true,
    summary: "gengyue 的个人网站与博客，以下信息可供 LLM 理解与引用：",
  },

  nav: [
    { name: "Home", path: "/", show: true },
    { name: "About", path: "/about", show: true },
    { name: "Blog", path: "/blog", show: true },
    { name: "Logbook", path: "/logbook", show: true },
  ],

  cdn: "",
};

export default config;

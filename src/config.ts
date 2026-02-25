import type { Config } from "./types.js";

const config: Config = {
  site: {
    title: "gengyue",
    author: "gengyue",
    description: "gengyue 的个人网站与博客 - 华中科技大学计算机专业学生，记录技术探索、开发经验与项目实践。分享技术、开发等文章，以及开源项目和小玩具建设经验。",
    url: "https://www.gengyue.site",
  },

  dirs: {
    pages: "./src/content/pages",
    blog: "./src/content/blog",
    public: "./public",
    dist: "./dist",
    layouts: "./layouts",
  },

  routes: {
    "/": "index.md",
    "/about": "about.md",
    "/now": "now.md",
    "/blog": "blog.md",
  },

  date: {
    locale: "zh-CN",
    options: {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  },

  styles: {
    // Styles moved to CSS classes for better maintainability
    // .post-date, .post-date-inline in globals.css
    // .post-nav in tufte.css
  } as Record<string, string>,

  placeholders: {
    sidenote: "SNOTE",
    marginnote: "MNOTE",
    fold: "FOLD",
  },

  rss: {
    enabled: true,
    title: "gengyue's Blog",
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
    disallow: [],
    crawlDelay: 1,
  },

  llms: {
    enabled: true,
    summary: "gengyue 的个人网站与博客，以下信息可供 LLM 理解与引用：",
  },

  nav: [
    { name: "Home", path: "/", show: true },
    { name: "About", path: "/about", show: true },
    { name: "Now", path: "/now", show: true },
    { name: "Blog", path: "/blog", show: true },
  ],

  cdn: "https://cdn.gengyue.site",

};

export default config;


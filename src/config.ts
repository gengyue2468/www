import type { Config } from "./types.js";

const config: Config = {
  site: {
    title: "gengyue",
    author: "gengyue",
    description: "The personal website of gengyue.",
    url: "http://106.53.99.53/",
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

  markdown: {
    breaks: true,
    gfm: true,
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
    date: "font-style: italic; color: #666; margin-top: -1rem; margin-bottom: 2rem;",
    dateInline:
      "font-style: italic; color: #666; font-size: 0.9em; white-space: nowrap;",
    nav: "margin-top: 3rem; font-size: 1.4rem;",
    navLink: "white-space: nowrap;",
  },

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
    items: {
      limit: 200,
    },
  },

  sitemap: {
    enabled: true,
    changefreq: "weekly",
    priority: {
      home: 1.0,
      pages: 0.8,
      blog: 0.9,
      posts: 0.7,
    },
  },

  robots: {
    enabled: true,
    userAgent: "*",
    allow: ["/"],
    disallow: [],
  },
};

export default config;


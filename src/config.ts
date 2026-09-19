import type { Config } from "./types.js";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const config: Config = {
  rootDir,
  site: {
    title: "gengyue",
    author: "gengyue",
    description:
      "gengyue 的个人网站与博客 - 华中科技大学计算机专业学生，记录技术探索、开发经验与项目实践。分享技术、开发等文章，以及开源项目和小玩具建设经验。",
    url: "https://www.gengyue.dev",
    ogImage: "/static/og/og-image.webp",
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: "gengyue - 个人网站与博客",
  },

  dirs: {
    pages: join(rootDir, "content", "pages"),
    public: join(rootDir, "public"),
    dist: join(rootDir, "dist"),
    layouts: join(rootDir, "layouts"),
  },

  routes: {
    "/": "index.md",
    "/about": "about.md",
    "/uses": "uses.md",
    "/colophon": "colophon.md",
    "/playlist": "playlist.md",
    "/guestbook": "guestbook.md",
    "/friends": "friends.md",
  },

  collections: [
    {
      name: "blog",
      srcDir: join(rootDir, "content", "blog"),
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
      srcDir: join(rootDir, "content", "logbook"),
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

  placeholders: {
    sidenote: "SNOTE",
    marginnote: "MNOTE",
  },

  umami: {
    enabled: true,
    scriptUrl: "https://u.gy.run/script.js",
    websiteId: "365406e1-29dc-44b9-895d-ff41a1e21ae1",
  },

  isso: {
    enabled: true,
    endpoint: "https://www.gengyue.dev/isso/",
    scriptUrl: "https://www.gengyue.dev/isso/js/embed.min.js",
    pageAuthorHashes: "02b0b77186c6",
    cap: {
      enabled: true,
      widgetScriptUrl: "https://www.gengyue.dev/cap/assets/widget.js",
      apiEndpoint: "https://www.gengyue.dev/cap/46a5d669de/",
    },
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
    changefreqHome: "daily",
    changefreqPages: "monthly",
    changefreqBlog: "weekly",
    changefreqPosts: "monthly",
    priority: { home: 1.0, pages: 0.8, blog: 0.9, posts: 0.7 },
  },

  robots: {
    enabled: true,
    userAgent: "*",
    allow: ["/"],
    disallow: ["/*.md"],
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
    {
      name: "More",
      path: "/more",
      show: true,
      children: [
        { name: "Logbook", path: "/logbook", show: true },
        { name: "Friends", path: "/friends", show: true },
        { name: "Guestbook", path: "/guestbook", show: true },
        { name: "Colophon", path: "/colophon", show: true },
        { name: "Uses", path: "/uses", show: true },
        { name: "Playlist", path: "/playlist", show: true },
      ],
    },
  ],
};

export default config;

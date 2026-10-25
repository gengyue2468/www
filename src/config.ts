import type { Config } from "./types.js";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const config: Config = {
  rootDir,
  site: {
    title: "gengyue's webpage",
    author: "gengyue",
    description: "gengyue's webpage",
    url: "https://www.gengyue.dev",
    ogImage: "/static/og/og-image.webp",
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: "gengyue's webpage",
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
    "/colophon": "colophon.md",
    "/guestbook": "guestbook.md",
    "/friends": "friends.md",
    "/memos": "memos.md",
    "/status": "status.md",
    "/track": "track.md",
    "/speedtest": "speedtest.md",
    "/vps": "vps.md",
  },

  collections: [
    {
      name: "blog",
      description: "写得稍微长一点的东西。",
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
      description: "随手记下的折腾过程，免得下次再踩一遍。",
      srcDir: join(rootDir, "content", "logbook"),
      urlPrefix: "logbook",
      tags: true,
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
    additionalLanguages: ["en-US"],
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
    changefreqTags: "weekly",
    priority: { home: 1.0, pages: 0.8, blog: 0.9, posts: 0.7, tags: 0.6 },
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
    summary: "gengyue's webpage summary",
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
        { name: "Logbook", path: "/logbook", show: true, group: "Navigation" },
        { name: "Memos", path: "/memos", show: true, group: "Navigation" },
        { name: "Track", path: "/track", show: true, group: "Navigation" },
        { name: "Colophon", path: "/colophon", show: true, group: "Navigation" },
        { name: "Friends", path: "/friends", show: true, group: "Interaction" },
        { name: "Guestbook", path: "/guestbook", show: true, group: "Interaction" },
        { name: "Status", path: "/status", show: true, group: "Tools" },
        { name: "VPS", path: "/vps", show: true, group: "Tools" },
        { name: "Speedtest", path: "/speedtest", show: true, group: "Tools" },
      ],
    },
  ],
};

export default config;

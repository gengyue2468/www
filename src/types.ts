export interface SiteConfig {
  title: string;
  author: string;
  description: string;
  url: string;
}

export interface DirsConfig {
  pages: string;
  blog: string;
  public: string;
  dist: string;
  layouts: string;
}

export interface DateConfig {
  locale: string;
  options: Intl.DateTimeFormatOptions;
}

export interface StylesConfig {
  date: string;
  dateInline: string;
  nav: string;
  navLink: string;
}

export interface PlaceholdersConfig {
  sidenote: string;
  marginnote: string;
  fold: string;
}

export interface Config {
  site: SiteConfig;
  dirs: DirsConfig;
  routes: Record<string, string>;
  date: DateConfig;
  styles: StylesConfig;
  placeholders: PlaceholdersConfig;
  rss: RSSConfig;
  sitemap: SitemapConfig;
  robots: RobotsConfig;
}

export interface RSSConfig {
  enabled: boolean;
  title: string;
  description: string;
  language: string;
  copyright: string;
  items: { limit: number };
}

export interface SitemapConfig {
  enabled: boolean;
  changefreq: string;
  priority: Record<string, number>;
}

export interface RobotsConfig {
  enabled: boolean;
  userAgent: string;
  allow: string[];
  disallow: string[];
}

export interface FrontMatter {
  title?: string;
  date?: string;
  excerpt?: string;
  summary?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface Note {
  type: "sidenote" | "marginnote";
  content: string;
  placeholder: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  summary: string;
  tags: string[];
}

export interface RenderedContent {
  frontmatter: FrontMatter;
  html: string;
}


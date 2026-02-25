export interface SiteConfig {
  title: string;
  author: string;
  description: string;
  url: string;
  /** 静态 OG 图路径，如 /static/og/default.webp；有 cdn 时自动用 cdn 域名 */
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
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
  // Styles are now defined in CSS files for better maintainability
  // .post-date, .post-date-inline in globals.css
  // .post-nav in tufte.css
  [key: string]: string;
}

export interface PlaceholdersConfig {
  sidenote: string;
  marginnote: string;
  fold: string;
}

export interface NavItem {
  name: string;
  path: string;
  show: boolean;
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
  llms: LlmsConfig;
  cdn: string;
  nav: NavItem[];
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
  crawlDelay?: number;
}

export interface LlmsConfig {
  enabled: boolean;
  /** 可选：llms.txt 中的一句话摘要，不填则用 site.description */
  summary?: string;
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


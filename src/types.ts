export interface SiteConfig {
  title: string;
  author: string;
  description: string;
  url: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
}

export interface DirsConfig {
  pages: string;
  public: string;
  dist: string;
  layouts: string;
}

export interface DateConfig {
  locale: string;
  options: Intl.DateTimeFormatOptions;
}

export interface StylesConfig {
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

export interface AnalyticsConfig {
  enabled: boolean;
  scriptUrl: string;
  websiteId: string;
}

export interface Config {
  site: SiteConfig;
  dirs: DirsConfig;
  routes: Record<string, string>;
  date: DateConfig;
  styles: StylesConfig;
  placeholders: PlaceholdersConfig;
  analytics: AnalyticsConfig;
  rss: RSSConfig;
  sitemap: SitemapConfig;
  robots: RobotsConfig;
  llms: LlmsConfig;
  cdn: string;
  nav: NavItem[];
  collections: CollectionConfig[];
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
  summary?: string;
}

export interface CollectionConfig {
  name: string;
  srcDir?: string;
  urlPrefix?: string;
  tags?: boolean;
  layouts?: Partial<{
    index: string;
    post: string;
    tags: string;
  }>;
}

export interface CollectionOutput {
  name: string;
  urlPrefix: string;
  srcDir: string;
  items: Post[];
}

export interface FrontMatter {
  title?: string;
  date?: string;
  excerpt?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface Note {
  type: string;
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

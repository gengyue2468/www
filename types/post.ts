type PostFrontmatter = {
  title?: string;
  date?: string;
  summary?: string;
};

type Post = {
  slug: string;
  title: string;
  date?: string;
  summary?: string;
  file: string;
  wordCount?: number;
};

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type { Post, PostFrontmatter, TocItem };
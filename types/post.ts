type PostFrontmatter = {
  title?: string;
  date?: string;
};

type Post = {
  slug: string;
  title: string;
  date?: string;
  file: string;
};

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export type { Post, PostFrontmatter, TocItem };
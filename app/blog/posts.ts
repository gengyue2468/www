export type PostFrontmatter = {
  title?: string;
  date?: string;
};

type PostModule = {
  default: unknown;
  frontmatter?: PostFrontmatter;
};

const modules = import.meta.glob<PostModule>("./*.mdx", {
  eager: true,
});

export type Post = {
  slug: string;
  title: string;
  date?: string;
  file: string;
};

const normalizePosts = (): Post[] => {
  return Object.entries(modules).map(([path, mod]) => {
    const slug = path.split("/").pop()!.replace(/\.mdx$/, "");
    const fm = mod.frontmatter ?? {};
    return {
      slug,
      title: fm.title ?? slug,
      date: fm.date,
      file: `../blog/${slug}.mdx`,
    };
  });
};

export const allPosts: Post[] = normalizePosts().sort((a, b) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date < b.date ? 1 : -1;
});

export const findPostBySlug = (slug: string): Post | undefined =>
  allPosts.find((p) => p.slug === slug);


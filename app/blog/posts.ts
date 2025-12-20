import type { Post, PostFrontmatter } from "@/types/post";

type PostModule = {
  default: unknown;
  frontmatter?: PostFrontmatter;
};

const modules = import.meta.glob<PostModule>("./*.mdx", {
  eager: true,
});

const normalizePosts = (): Post[] => {
  return Object.entries(modules).map(([path, mod]) => {
    const slug = path
      .split("/")
      .pop()!
      .replace(/\.mdx$/, "");
    const fm = mod.frontmatter ?? {};
    return {
      slug,
      title: fm.title ?? slug,
      date: fm.date,
      file: path,
    };
  });
};

export const allPosts: Post[] = normalizePosts().sort((a, b) => {
  if (a.date && b.date) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  } else if (a.date) {
    return -1;
  } else if (b.date) {
    return 1;
  }
  return 0;
});

export const findPostBySlug = (slug: string): Post | undefined =>
  allPosts.find((p) => p.slug === slug);

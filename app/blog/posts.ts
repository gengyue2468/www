import type { Post, PostFrontmatter } from "@/types/post";
import React from "react";
import ReactDOMServer from "react-dom/server";

type PostModule = {
  default: unknown;
  frontmatter?: PostFrontmatter;
};

const modules = import.meta.glob<PostModule>("./*.mdx", {
  eager: true,
});

function getMixedWordCount(text: string) {
  if (!text) return 0;

  const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z0-9]+/g) || []).length;

  return chineseCount + englishCount;
}

function extractTextFromMDX(mod: PostModule) {
  if (!mod?.default) return "";
  try {
    const element = React.createElement(mod.default as any);
    const html = ReactDOMServer.renderToStaticMarkup(element);
    return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  } catch (e) {
    console.error("extractTextFromMDX error:", e);
    return "";
  }
}


const normalizePosts = (): Post[] => {
  return Object.entries(modules).map(([path, mod]) => {
    const slug = path.split("/").pop()!.replace(/\.mdx$/, "");
    const fm = mod.frontmatter ?? {};
    const text = extractTextFromMDX(mod);
    const wordCount = getMixedWordCount(text);

    return {
      slug,
      title: fm.title ?? slug,
      date: fm.date,
      summary: fm.summary ?? "",
      file: path,
      wordCount,
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

export const getAllPostsWordCount = () =>
  allPosts.reduce((acc, post) => acc + (post.wordCount ?? 0), 0);

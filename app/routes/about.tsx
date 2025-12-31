import type { Route } from "./+types/about";
import { useLoaderData } from "react-router";
import { allPosts, findPostBySlug } from "@/blog/posts";
import PostLayout from "@/components/PostLayout";
import PostsList from "@/components/PostsList";

const mdxModules = import.meta.glob<{ default: any }>("../pages/*.mdx", {
  eager: true,
});

export function loader() {
  let post = findPostBySlug("about");

  // Fallback: if posts index didn't include `about`, try to read its frontmatter directly
  if (!post) {
    const mod = mdxModules["../pages/about.mdx"] as any | undefined;
    const fm = mod?.frontmatter ?? {};
    if (fm.title || fm.date || fm.summary) {
      post = {
        slug: "about",
        title: fm.title ?? "关于我",
        date: fm.date,
        summary: fm.summary ?? "",
        file: "../pages/about.mdx",
      } as any;
    }
  }

  if (!post) throw new Response("Not Found", { status: 404 });
  return { post };
}

export function meta({ data }: Route.MetaArgs) {
  const post = (data as any)?.post;
  if (!post) return [{ title: "关于" }];
  return [{ title: `${post.title} - Geng Yue 的博客` }];
}

export default function About() {
  const { post } = useLoaderData() as any;
  const mdxKey = `../pages/${post.slug}.mdx`;
  const mod = mdxModules[mdxKey] as any | undefined;
  const MDXContent = mod?.default;

  return (
    <>
      <PostLayout
        title={post.title}
        date={post.date}
        summary={(post as any)?.summary}
        headerCentered
        showSummary={true}
      >
        {MDXContent ? <MDXContent /> : <p>文章内容加载失败。</p>}
      </PostLayout>

      <section className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-semibold mb-4 text-center">全部文章</h2>
        <PostsList posts={allPosts} />
      </section>
    </>
  );
}

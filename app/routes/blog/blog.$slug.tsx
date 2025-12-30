import type { Route } from "./+types/blog.$slug";
import { useLoaderData } from "react-router";
import { allPosts, findPostBySlug } from "@/blog/posts";
import PostLayout from "@/components/PostLayout";
import PostsList from "@/components/PostsList";

const mdxModules = import.meta.glob<{ default: any }>("../../blog/*.mdx", {
  eager: true,
});

export function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug;
  if (!slug) throw new Response("Not Found", { status: 404 });
  const post = findPostBySlug(slug);
  if (!post) throw new Response("Not Found", { status: 404 });
  const index = allPosts.findIndex((p) => p.slug === slug);
  const previous =
    index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null;
  const next = index > 0 ? allPosts[index - 1] : null;
  return { slug, post, previous, next };
}

export function meta({ data }: Route.MetaArgs) {
  const post = (data as any)?.post;
  if (!post) return [{ title: "Geng Yue 的博客" }];
  return [{ title: `${post.title} - Geng Yue 的博客` }];
}

export default function BlogPost() {
  const { post, previous, next } = useLoaderData() as any;
  const mdxKey = `../../blog/${post.slug}.mdx`;
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
        previous={previous}
        next={next}
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

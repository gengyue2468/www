import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/home";
import { allPosts } from "@/blog/posts";
import { PostLayout, PostsList } from "@/components/blog";

export async function loader({}: Route.LoaderArgs) {
  return { posts: allPosts };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Geng Yue" }, { name: "robots", content: "index, follow" }];
}

const mdxModules = import.meta.glob<{ default: any }>("../blog/*.mdx", {
  eager: true,
});

export default function Home() {
  const { posts } = useLoaderData<typeof loader>();
  const latest = posts && posts.length > 0 ? posts[0] : null;

  const LatestContent = latest
    ? (mdxModules[`../blog/${latest.slug}.mdx`] as any)?.default
    : null;

  return (
    <>
      <PostLayout
        title={latest ? latest.title : undefined}
        date={latest?.date}
        summary={latest?.summary}
        headerCentered
        showSummary={true}
      >
        {LatestContent ? <LatestContent /> : null}
      </PostLayout>

      <section className="max-w-2xl mx-auto px-6 pb-24 pt-8">
        <h2 className="text-2xl font-bold mb-8 text-center tracking-tight">全部文章</h2>
        <PostsList posts={posts} />
      </section>
    </>
  );
}

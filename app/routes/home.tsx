import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/home";
import { allPosts } from "@/blog/posts";
import React from "react";
import dayjs from "dayjs";
import PostsList from "@/components/PostsList";
import PostLayout from "@/components/PostLayout";

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

      <div className="mt-8 mb-8 tracking-widest flex justify-center">* * *</div>

      <section className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-semibold mb-4 text-center">全部文章</h2>
        <PostsList posts={posts} />
      </section>
    </>
  );
}

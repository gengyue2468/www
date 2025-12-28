import { useLoaderData } from "react-router";
import type { Route } from "./+types/blog._index";
import { allPosts } from "@/blog/posts";
import RouterBack from "@/components/public/route/route-back";
import { Intro, AllPosts } from "@/components/blog";
import LayoutTemplate from "@/components/public/template/layout-template";

export function loader({}: Route.LoaderArgs) {
  return { posts: allPosts };
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

export default function BlogIndex() {
  const { posts } = useLoaderData() as LoaderData;

  if (!posts.length) {
    return <p>还没有文章欸</p>;
  }

  return (
    <>
      <LayoutTemplate left={<Intro wordCount={0} />} right={<AllPosts posts={posts} />} />
    </>
  );
}

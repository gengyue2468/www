import { useLoaderData } from "react-router";
import type { Route } from "./+types/blog._index";
import { allPosts } from "../blog/posts";
import RouterBack from "~/components/public/route-back";
import { Header, AllPosts } from "~/components/blog";

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
      <RouterBack to="/" />
      <Header />
      <AllPosts posts={posts} />
    </>
  );
}

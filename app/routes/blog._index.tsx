import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/blog._index";
import { allPosts, type Post } from "../blog/posts";
import dayjs from "dayjs";

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
      <div className="static md:fixed md:left-[max(2rem,calc(50%-28rem))] md:top-16 mb-6 md:mb-0">
        <Link
          to="/"
          className="text-sm no-underline! font-medium"
          prefetch="intent"
        >
          ↖ 返回
        </Link>
      </div>
      <header className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col">
          <h1 className="font-semibold">博客</h1>
          <p className="font-medium text-neutral-600 dark:text-neutral-400">
            一些有意思或者没意思的东西
          </p>
        </div>
      </header>
      <ul className="space-y-0 mt-2 group">
        {posts.map((post: Post) => (
          <Link
            to={`/blog/${post.slug}`}
            className="py-1 no-underline! flex flex-row items-center gap-4 justify-between group-hover:opacity-30 hover:opacity-100 transition-opacity"
            key={post.slug}
          >
            <h2 className="font-semibold">{post.title}</h2>
            {post.date && (
              <p className="font-medium text-neutral-600 dark:text-neutral-400">
                {dayjs(post.date).format("YYYY/MM/DD")}
              </p>
            )}
          </Link>
        ))}
      </ul>
    </>
  );
}

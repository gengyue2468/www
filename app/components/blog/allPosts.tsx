import { Link } from "react-router";
import dayjs from "dayjs";

import type { Post } from "@/types/post";

export default function AllPosts({ posts }: { posts: Post[] }) {
  return (
    <ul className="-mx-4 space-y-0 group text-2xl xl:text-3xl">
      {posts.map((post: Post) => (
        <Link
          to={`/blog/${post.slug}`}
          className="hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg px-4 py-2 no-underline! flex flex-col gap-0 justify-between group-hover:opacity-30 hover:opacity-100 transition-opacity"
          key={post.slug}
        >
          <h2 className="font-semibold">{post.title}</h2>
          {post.date && (
            <p className="font-medium text-neutral-600 dark:text-neutral-400">
              {dayjs(post.date).format("YYYY年MM月DD日")}
            </p>
          )}
        </Link>
      ))}
    </ul>
  );
}

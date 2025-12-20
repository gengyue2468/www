import { Link } from "react-router";
import dayjs from "dayjs";

import type { Post } from "@/types/post";

export default function AllPosts({ posts }: { posts: Post[] }) {
  return (
    <ul className="space-y-0 mt-6 group">
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
  );
}

import { Link } from "react-router";
import type { Post } from "@/types/post";

interface PrevNextPostsProps {
  previous?: Post | null;
  next?: Post | null;
}

export default function PrevNextPosts({ previous, next }: PrevNextPostsProps) {
  return (
    <nav className="mt-8 flex flex-col md:flex-row gap-4 justify-between not-prose">
      {previous ? (
        <Link
          to={`/blog/${previous.slug}`}
          prefetch="intent"
          className="no-underline! flex flex-col gap-1"
        >
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            上一篇
          </span>
          <span className="font-semibold">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={`/blog/${next.slug}`}
          prefetch="intent"
          className="no-underline! flex flex-col gap-1"
        >
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            下一篇
          </span>
          <span className="font-semibold">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

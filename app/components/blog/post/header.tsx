import dayjs from "dayjs";
import type { Post } from "@/types/post";
import { Link } from "react-router";

interface HeaderProps {
  post: Post;
}

export default function Header({ post }: HeaderProps) {
  return (
   <section className="">
      <div>
        <Link
          to="/"
          className="text-neutral-600 dark:text-neutral-400 no-underline!"
        >
          ↖ 返回
        </Link>
      </div>
      <div className="mt-8">
        <h1 className="font-semibold">
         {post.title}
        </h1>
        <h2 className="text-neutral-600 dark:text-neutral-400">
          {dayjs(post.date).format("YYYY年MM月DD日")}
        </h2>
      </div>
    </section>
  );
}

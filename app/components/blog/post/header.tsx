import dayjs from "dayjs";
import type { Post } from "../../../../types/post";

interface HeaderProps {
  post: Post;
}

export default function Header({ post }: HeaderProps) {
  return (
    <header className="flex flex-row justify-between items-center mb-6">
      <div className="flex flex-col">
        <h1 className="font-semibold">{post.title}</h1>
        <p className="font-medium text-neutral-600 dark:text-neutral-400">
          {dayjs(post.date).format("YYYY/MM/DD")}
        </p>
      </div>
    </header>
  );
}

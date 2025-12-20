import dayjs from "dayjs";
import type { Post } from "@/types/post";
import HeaderTemplate from "@/components/public/template/header-template";

interface HeaderProps {
  post: Post;
}

export default function Header({ post }: HeaderProps) {
  return (
    <HeaderTemplate
      title={post.title}
      description={dayjs(post.date).format("YYYY/MM/DD")}
    />
  );
}

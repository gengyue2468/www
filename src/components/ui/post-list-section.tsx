import type { ReactNode } from "react";
import type { BlogPost } from "#/lib/blog";
import PostCard from "./post-card";

export interface PostListSectionProps {
  posts: BlogPost[];
  sidenote?: ReactNode;
  className?: string;
  listClassName?: string;
}

export default function PostListSection({
  posts,
  sidenote,
  className = "",
  listClassName = "",
}: PostListSectionProps) {
  const sectionClassName = ["page-post-group", className].filter(Boolean).join(" ");
  const postsClassName = ["page-post-list", "page-post-list-offset", listClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={sectionClassName}>
      {sidenote && <span className="sidenote">{sidenote}</span>}
      <div className={postsClassName}>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

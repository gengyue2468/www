import { Link } from "react-router";
import dayjs from "dayjs";

import { allPosts } from "../../blog/posts";
import type { Post } from "../../../types/post";

const latestPosts = allPosts.slice(0, 3);

export default function Posts() {
  return (
    <section className="mt-8 space-y-4">
      <h3 className="font-semibold">
        对了，我还经常写一些很史的文章，由于没有良好的文笔，所以写出来的东西也就那样……看看得了
      </h3>

      {latestPosts.length > 0 ? (
        <ul className="space-y-0">
          {latestPosts.map((post: Post) => (
            <Link
              to={`/blog/${post.slug}`}
              prefetch="intent"
              className="py-1 no-underline! flex flex-row items-center gap-4 justify-between group-hover:opacity-30 hover:opacity-100 transition-opacity"
              key={post.slug}
            >
              <h2 className="font-medium">{post.title}</h2>
              {post.date && (
                <p className="font-normal text-neutral-600 dark:text-neutral-400">
                  {dayjs(post.date).format("YYYY/MM/DD")}
                </p>
              )}
            </Link>
          ))}
        </ul>
      ) : null}

      <p>
        这些文章大多是一些奇怪的/有用的/没用的想法。如果你有兴趣，可以访问我的{" "}
        <Link to="/blog" prefetch="intent">
          博客页面
        </Link>
        查看更多内容。
      </p>

      <Link to="/blog" prefetch="intent" className="font-medium">
        查看所有文章 →
      </Link>
    </section>
  );
}

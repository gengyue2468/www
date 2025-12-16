import type { ComponentType } from "react";
import type { Route } from "./+types/blog.$slug";
import { MDXProvider } from "@mdx-js/react";
import { Link, useLoaderData } from "react-router";
import { allPosts, findPostBySlug } from "../blog/posts";
import dayjs from "dayjs";

const mdxModules = import.meta.glob("../blog/*.mdx", {
  eager: true,
});

export function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug;
  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }
  const post = findPostBySlug(slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  const index = allPosts.findIndex((p) => p.slug === slug);
  const previous =
    index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null;
  const next = index > 0 ? allPosts[index - 1] : null;
  return { slug, post, previous, next };
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

const components: Parameters<typeof MDXProvider>[0]["components"] = {};

export function meta({ data }: Route.MetaArgs) {
  const loaderData = data as LoaderData | undefined;
  const post = loaderData?.post;

  if (!post) {
    return [{ title: "Geng Yue 的博客" }];
  }

  return [{ title: `${post.title} - Geng Yue 的博客` }];
}

export default function BlogPost() {
  const { post, previous, next } = useLoaderData() as LoaderData;
  const mod = mdxModules[post.file] as
    | { default?: ComponentType<any> }
    | undefined;
  const MDXContent = mod?.default;

  if (!MDXContent) {
    return (
      <p className="text-sm text-red-500">
        文章内容加载失败：没有找到对应的 MDX 组件。
      </p>
    );
  }

  return (
    <section>
      <div className="static md:absolute mx-0 md:-mx-32 mb-6 md:mb-0">
        <Link to="/blog" className="no-underline! font-medium text-sm">
          ↖ 返回
        </Link>
      </div>
      <header className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col">
          <h1 className="font-semibold">{post.title}</h1>
          <p className="font-medium text-neutral-600 dark:text-neutral-400">
            {dayjs(post.date).format("YYYY/MM/DD")}
          </p>
        </div>
      </header>
      <article
        className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:text-base
      prose-li:-mx-6  max-w-none"
      >
        <MDXProvider components={components}>
          <MDXContent />
        </MDXProvider>
      </article>
      <div className="mt-8 flex flex-row items-center justify-between *:no-underline!">
        <Link
          to={`https://github.com/gengyue2468/www/edit/main/app/blog/${post.file}`}
          className="font-medium"
        >
          在 GitHub 上编辑 →
        </Link>
        <button
          type="button"
          className="font-medium cursor-pointer hover:opacity-75"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          顶部 ↑
        </button>
      </div>
      <nav className="mt-8 flex flex-col md:flex-row gap-4 justify-between not-prose">
        {previous ? (
          <Link
            to={`/blog/${previous.slug}`}
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
    </section>
  );
}

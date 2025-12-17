import type { ComponentType } from "react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import type { Route } from "./+types/blog.$slug";
import { MDXProvider } from "@mdx-js/react";
import { Link, useLoaderData } from "react-router";
import { allPosts, findPostBySlug } from "../blog/posts";
import dayjs from "dayjs";
import { OptimizedImage } from "../components/OptimizedImage";

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

type TocItem = {
  id: string;
  text: string;
  level: number;
};

const createHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
  return function Heading({ children, ...props }: any) {
    const getText = (node: any): string => {
      if (typeof node === "string") return node;
      if (typeof node === "number") return String(node);
      if (Array.isArray(node)) return node.map(getText).join("");
      if (node?.props?.children) return getText(node.props.children);
      return "";
    };
    const text = getText(children);
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u4e00-\u9fa5-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return React.createElement(Tag, { id, ...props }, children);
  };
};

const createComponents = (): Parameters<typeof MDXProvider>[0]["components"] => ({
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  img: (props: any) => (
    <OptimizedImage
      src={props.src || props.href}
      alt={props.alt || ""}
      loading="lazy"
      className="prose-img"
    />
  ),
});

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
  
  const components = useMemo(() => createComponents(), []);

  const mod = mdxModules[post.file] as
    | { default?: ComponentType<any> }
    | undefined;
  const MDXContent = mod?.default;
  const articleRef = useRef<HTMLElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!articleRef.current) return;

    const headings = articleRef.current.querySelectorAll(
      "h1, h2, h3, h4, h5, h6"
    );
    const tocItems: TocItem[] = [];

    headings.forEach((heading) => {
      const id =
        heading.id ||
        heading.textContent?.toLowerCase().replace(/\s+/g, "-") ||
        "";
      if (!heading.id && id) {
        heading.id = id;
      }
      tocItems.push({
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.charAt(1)),
      });
    });

    setToc(tocItems);
  }, [post.slug]);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );

    const headings = articleRef.current?.querySelectorAll(
      "h1, h2, h3, h4, h5, h6"
    );
    headings?.forEach((heading) => observer.observe(heading));

    return () => {
      headings?.forEach((heading) => observer.unobserve(heading));
    };
  }, [toc]);

  if (!MDXContent) {
    return (
      <p className="text-sm text-red-500">
        文章内容加载失败：没有找到对应的 MDX 组件。
      </p>
    );
  }

  return (
    <section className="relative">
      <div className="static md:fixed md:left-[max(2rem,calc(50%-28rem))] md:top-16 mb-6 md:mb-0">
        <Link to="/blog" className="text-sm no-underline! font-medium">
          ↖ 返回
        </Link>
      </div>

      {toc.length > 0 && (
        <div className="text-sm hidden md:block md:fixed md:right-[max(2rem,calc(50%-36rem))] md:top-16 w-48">
          <div className="font-medium mb-2 text-neutral-600 dark:text-neutral-400">
            目录
          </div>
          <nav className="space-y-1">
            {toc.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="no-underline! block"
              >
                {index + 1}.{item.text}
              </a>
            ))}
          </nav>
        </div>
      )}

      <div>
        <header className="flex flex-row justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="font-semibold">{post.title}</h1>
            <p className="font-medium text-neutral-600 dark:text-neutral-400">
              {dayjs(post.date).format("YYYY/MM/DD")}
            </p>
          </div>
        </header>
        <article
          ref={articleRef}
          className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:text-base
        prose-li:-mx-6  max-w-none"
        >
          <MDXProvider components={components}>
            <MDXContent />
          </MDXProvider>
        </article>
        <div className="text-sm mt-8 flex flex-row items-center justify-between *:no-underline!">
          <Link
            to={`https://github.com/gengyue2468/www/edit/master/app/blog/${post.file}`}
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
      </div>
    </section>
  );
}

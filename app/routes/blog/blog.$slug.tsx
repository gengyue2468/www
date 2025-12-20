import type { ComponentType } from "react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import type { Route } from "./+types/blog.$slug";
import { MDXProvider } from "@mdx-js/react";
import { useLoaderData } from "react-router";
import { allPosts, findPostBySlug } from "@/blog/posts";
import { Image } from "@/components/public/img/image";
import RouterBack from "@/components/public/route/route-back";
import type { TocItem } from "@/types/post";
import { Toc, Header, Article, PrevNextPosts } from "@/components/blog/post";

const mdxModules = import.meta.glob<{ default: any }>(
  "../../blog/*.mdx",
  { eager: true }
);

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

const createComponents = (): Parameters<
  typeof MDXProvider
>[0]["components"] => ({
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  img: (props: any) => (
    <Image
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

  // post.file 现在是 glob 返回的相对于 app/blog/ 的完整路径
  // 但在 blog.$slug 中需要调整为相对于该文件的路径
  const mdxKey = `../../blog/${post.slug}.mdx`;
  const mod = mdxModules[mdxKey] as
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
      <>
      <RouterBack to="/blog" />
      <h1 className="font-semibold">坏事了！</h1>
      <p>文章内容加载失败：没有找到对应的 MDX 组件。</p>
      </>
    );
  }

  return (
    <section className="relative">
      <RouterBack to="/blog" />
      <Toc toc={toc} />
      <Header post={post} />
      <div>
        <Article
          MDXContent={MDXContent}
          post={post}
          articleRef={articleRef}
          components={components}
        />
        <PrevNextPosts previous={previous} next={next} />
      </div>
    </section>
  );
}

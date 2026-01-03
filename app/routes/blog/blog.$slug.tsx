import type { Route } from "./+types/blog.$slug";
import { useLoaderData, redirect } from "react-router";
import { allPosts, findPostBySlug } from "@/blog/posts";
import { PostLayout, PostsList, Toc, ReadingAside } from "@/components/blog";
import { useTocSetter } from "@/contexts/toc-context";
import { useState, useEffect } from "react";

const mdxModules = import.meta.glob<{ default: any; toc?: any }>("../../blog/*.mdx", {
  eager: true,
});

export function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug;
  if (!slug) throw new Response("Not Found", { status: 404 });

  // Redirect /blog/about to /about
  if (slug === "about") return redirect("/about");

  const post = findPostBySlug(slug);
  if (!post) throw new Response("Not Found", { status: 404 });

  // Exclude the about page from previous/next navigation
  const blogPosts = allPosts.filter((p) => p.slug !== "about");
  const index = blogPosts.findIndex((p) => p.slug === slug);
  const previous =
    index >= 0 && index < blogPosts.length - 1 ? blogPosts[index + 1] : null;
  const next = index > 0 ? blogPosts[index - 1] : null;
  return { slug, post, previous, next };
}

export function meta({ data }: Route.MetaArgs) {
  const post = (data as any)?.post;
  if (!post) return [{ title: "Geng Yue 的博客" }];
  return [{ title: `${post.title} - Geng Yue 的博客` }];
}

export default function BlogPost() {
  const { post, previous, next } = useLoaderData() as any;
  const mdxKey = `../../blog/${post.slug}.mdx`;
  const mod = mdxModules[mdxKey] as any | undefined;
  const MDXContent = mod?.default;
  const toc = mod?.toc;
  const setToc = useTocSetter();
  
  const [wordCount, setWordCount] = useState(0);

  // 设置 TOC 到 context
  useEffect(() => {
    setToc(toc);
    return () => {
      setToc(undefined);
    };
  }, [toc, setToc]);

  // 在客户端计算字数
  useEffect(() => {
    const article = document.querySelector("article");
    if (article) {
      const text = article.innerText || "";
      const count = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
      setWordCount(count);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("分享取消");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("链接已复制到剪贴板！");
      } catch (err) {
        console.error("复制失败:", err);
      }
    }
  };

  return (
    <>
      <Toc toc={toc} />
      <ReadingAside
        date={post.date}
        readingTime={8}
        wordCount={wordCount}
        onShare={handleShare}
      />
      <PostLayout
        title={post.title}
        date={post.date}
        summary={(post as any)?.summary}
        headerCentered
        showSummary={true}
        previous={previous}
        next={next}
      >
        {MDXContent ? <MDXContent /> : <p>文章内容加载失败。</p>}
      </PostLayout>
      <section className="max-w-2xl mx-auto px-6 pb-24 xl:pb-16">
        <h2 className="text-3xl font-semibold mb-4 text-center">全部文章</h2>
        <PostsList posts={allPosts} />
      </section>
    </>
  );
}

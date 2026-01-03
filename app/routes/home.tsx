import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/home";
import { allPosts } from "@/blog/posts";
import { PostLayout, PostsList, Toc, ReadingAside } from "@/components/blog";
import { useTocSetter } from "@/contexts/toc-context";
import { useEffect, useState } from "react";

export async function loader({}: Route.LoaderArgs) {
  return { posts: allPosts };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Geng Yue" }, { name: "robots", content: "index, follow" }];
}

const mdxModules = import.meta.glob<{ default: any; toc?: any }>("../blog/*.mdx", {
  eager: true,
});

export default function Home() {
  const { posts } = useLoaderData<typeof loader>();
  const latest = posts && posts.length > 0 ? posts[0] : null;

  const mod = latest ? (mdxModules[`../blog/${latest.slug}.mdx`] as any) : null;
  const LatestContent = mod?.default;
  const toc = mod?.toc;
  const setToc = useTocSetter();

  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setToc(toc);
    return () => setToc(undefined);
  }, [toc, setToc]);

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
          title: latest?.title || "Geng Yue",
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
        date={latest?.date}
        readingTime={8}
        wordCount={wordCount}
        onShare={handleShare}
      />
      <PostLayout
        title={latest ? latest.title : undefined}
        date={latest?.date}
        summary={latest?.summary}
        headerCentered
        showSummary={true}
      >
        {LatestContent ? <LatestContent /> : null}
      </PostLayout>

      <section className="max-w-2xl mx-auto px-6 pb-24 pt-8">
        <h2 className="text-2xl font-bold mb-8 text-center tracking-tight">全部文章</h2>
        <PostsList posts={posts} />
      </section>
    </>
  );
}

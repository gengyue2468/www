import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import moment from "moment";
import { ArrowLeft, ChevronDown, ChevronDownIcon } from "lucide-react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { motion } from "framer-motion";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { Button } from "@/components/ui/button";
import TOC from "@/components/TOC";

// 自定义MDX组件
const components = {
  h1: ({ children, id }) => (
    <h1 id={id} className="font-semibold mb-2">
      {children}
    </h1>
  ),
  p: ({ children }) => <p className="mb-4">{children}</p>,
  img: ({ src, alt }) => (
    <div className="my-6">
      <img src={src} alt={alt} className="w-full h-auto rounded-lg shadow-md" />
    </div>
  ),
};

// 计算阅读时间（每分钟200字估算）
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
};

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [mdxSource, setMdxSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingTime, setReadingTime] = useState(0);
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState("");
  const contentRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`../api/notion/${id}`);
        if (!res.ok) throw new Error("Failed to fetch post");

        const data = await res.json();
        setPost(data);
        console.log(data);

        // 从Content属性获取原始MDX内容
        const mdxContent = data.page.properties.Content.rich_text
          .map((item) => item.plain_text)
          .join("");

        // 计算阅读时间
        setReadingTime(calculateReadingTime(mdxContent));

        // 序列化MDX内容
        const serialized = await serialize(mdxContent);
        setMdxSource(serialized);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // 提取标题用于目录
  useEffect(() => {
    if (!contentRef.current) return;

    const headings = Array.from(
      contentRef.current.querySelectorAll("h1, h2, h3")
    ).map((heading) => ({
      id: heading.getAttribute("id"),
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1), 10),
    }));

    setHeadings(headings);
  }, [mdxSource]);

  // 监听滚动位置，更新活跃标题
  useEffect(() => {
    const updateActiveHeading = () => {
      if (!contentRef.current) return;

      const scrollPosition = window.scrollY + 50;
      const headings = Array.from(
        contentRef.current.querySelectorAll("h1, h2, h3")
      );

      let currentActiveHeading = "";
      let closestDistance = Infinity;

      headings.forEach((heading) => {
        const headingTop = heading.offsetTop;
        const distance = Math.abs(headingTop - scrollPosition);
        const headingText = heading.textContent.trim(); // 使用标题文本作为标识
        console.log(headingTop, distance);
        if (headingTop <= scrollPosition && distance < closestDistance) {
          closestDistance = distance;
          currentActiveHeading = headingText;
        }
      });

      if (currentActiveHeading !== activeHeading) {
        setActiveHeading(currentActiveHeading);
      }
    };

    window.addEventListener("scroll", updateActiveHeading);
    updateActiveHeading();

    return () => window.removeEventListener("scroll", updateActiveHeading);
  }, [activeHeading, mdxSource]);

  return (
    <Layout
      title={post?.page.properties.Title.title[0]?.plain_text || "Loading..."}
      note={<TOC headings={headings} activeHeading={activeHeading} />}
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(5px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.25 }}
      >
        <button
          onClick={() => router.push("/thoughts")}
          className="flex flex-row space-x-2 items-center opacity-75 mb-4 hover:opacity-100 transition-all duration-500 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        {loading && <Loader />}
        {error && <Error error={error} />}
        {!loading && mdxSource && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
          >
            <div>
              <h1 className="font-semibold mb-2">
                {post.page.properties.Title.title[0]?.plain_text || "Untitled"}
              </h1>
              <div className="flex items-center text-sm opacity-75 mb-6">
                <span>
                  {moment(post.page.properties.Date?.date?.start).format(
                    "MMM DD, YYYY"
                  )}
                </span>
                <span className="mx-2">•</span>
                <span>{readingTime} min read</span>
              </div>
              <div
                ref={contentRef}
                className="prose dark:prose-inset max-w-none"
              >
                <MDXRemote {...mdxSource} components={components} />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default PostPage;

import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import moment from "moment";
import { AlertCircleIcon, ArrowDownToLineIcon, ArrowLeft } from "lucide-react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { motion } from "framer-motion";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import TOC from "@/components/TOC";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// 自定义MDX组件
const components = {
  Alert,
  AlertDescription,
  AlertTitle,
  AlertCircleIcon,
  h1: ({ children, id }) => (
    <h1 id={id} className="font-semibold my-2.5">
      {children}
    </h1>
  ),
  p: ({ children }) => <p className="mb-6">{children}</p>,
  img: ({ src, alt }) => (
    <div className="my-8">
      <LazyLoadImage
        effect="blur"
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg"
      />
      <div className="flex flex-row justify-between items-center">
        <span className="text-sm italic serif">{alt}</span>
        <Button
          onClick={() => open(src)}
          variant="secondary"
          className="size-6 rounded-full p-2 cursor-pointer"
        >
          <ArrowDownToLineIcon size={3} />
        </Button>
      </div>
    </div>
  ),
};

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

  useEffect(() => {
    if (!contentRef.current) return;

    // 获取所有h1标题
    const headingElements = Array.from(
      contentRef.current.querySelectorAll("h1")
    );
    if (headingElements.length === 0) {
      setHeadings([]);
      return;
    }

    // 为每个标题生成唯一ID并提取信息
    const extractedHeadings = headingElements.map((heading, index) => {
      const text = heading.innerText.trim() || `Untitled-${index}`; // 处理空标题
      // 生成合法ID：替换空格为横线，移除特殊字符，加索引确保唯一
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // 移除特殊字符
        .replace(/\s+/g, "-") // 空格转横线
        .replace(/-+/g, "-"); // 合并连续横线
      const id = `heading-${index}-${slug}`; // 最终ID（如：heading-0-intro）

      // 给标题元素设置生成的ID（用于后续滚动定位）
      heading.id = id;

      return {
        id, // 生成的唯一ID
        text, // 标题文本
        level: parseInt(heading.tagName.charAt(1), 10), // 标题级别（h1为1）
      };
    });

    setHeadings(extractedHeadings);
    // 初始化活跃标题为第一个标题
    if (extractedHeadings.length > 0) {
      setActiveHeading(extractedHeadings[0].id);
    }
  }, [mdxSource]); // 当内容更新时重新提取标题

  // 2. 监听滚动，更新当前活跃标题
  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;

    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      // 视口阈值：标题顶部进入视口下1/4处时判定为活跃（更符合阅读习惯）
      const threshold = viewportHeight / 4;

      let currentActiveId = "";

      // 遍历所有标题，找到当前视口内最顶部的标题
      headings.forEach(({ id }) => {
        const headingElement = document.getElementById(id);
        if (!headingElement) return;

        const rect = headingElement.getBoundingClientRect();
        // 标题顶部距离视口顶部的距离（可为负数，代表已滚过）
        const topInViewport = rect.top;

        // 条件：标题顶部 <= 阈值（进入视口内），且标题底部 > 0（未完全滚出视口）
        if (topInViewport <= threshold && topInViewport + rect.height > 0) {
          currentActiveId = id; // 最后满足条件的标题即为当前活跃标题
        }
      });

      // 仅在变化时更新状态（减少重渲染）
      if (currentActiveId !== activeHeading) {
        setActiveHeading(currentActiveId);
      }
    };

    // 监听滚动事件（被动模式提升性能）
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    // 初始化时执行一次（页面加载后立即判断）
    updateActiveHeading();

    // 清理函数：移除事件监听
    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
    };
  }, [headings, activeHeading]); // 依赖headings（标题变化时重新监听）和activeHeading

  return (
    <Layout
      title={post?.page.properties.Title.title[0]?.plain_text || "Loading..."}
      note={<TOC headings={headings} activeHeadingId={activeHeading} />}
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
                    "MMMM Do, YYYY"
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
              <div className="mb-64 sm:mb-80" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default PostPage;

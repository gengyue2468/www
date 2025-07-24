import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import moment from "moment";
import {
  AlertCircleIcon,
  ArrowDownToLineIcon,
  ArrowLeft,
  CopyIcon,
  DotIcon,
  QuoteIcon,
} from "lucide-react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { motion } from "framer-motion";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import TOC from "@/components/TOC";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Post from "@/components/Post";
import axios from "axios";

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
  a: ({ children, href, target }) => (
    <a
      href={href}
      target={target || "_self"}
      className="text-primary hover:text-primary/80 transition-colors duration-200 border-b border-primary/30 hover:border-primary/60 serif italic"
    >
      {children}
    </a>
  ),
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
  const chineseCharsPerMinute = 200;
  const englishWordsPerMinute = 200;
  
  if (!content) return 0;
  
  const chineseChars = content.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g);
  const chineseCount = chineseChars ? chineseChars.length : 0;
  
  const englishContent = content.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, ' ');
  const englishWords = englishContent.match(/\b[\w']+\b/g);
  const englishCount = englishWords ? englishWords.length : 0;
  
  const chineseMinutes = chineseCount / chineseCharsPerMinute;
  const englishMinutes = englishCount / englishWordsPerMinute;

  return Math.ceil(chineseMinutes + englishMinutes) || 1;
};

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [posts, setPosts] = useState(null);
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
        //清除文章
        setPost(null);
        setMdxSource(null);
        setLoading(true);
        // 发起两个请求
        const res = await axios.get(`../api/notion/${id}`);
        const resAll = await axios.get(`../api/notion`);

        // 检查请求状态（axios不会自动为4xx/5xx状态抛错）
        if (res.status < 200 || res.status >= 300) {
          throw new Error(`拉取单篇文章失败: ${res.statusText}`);
        }
        if (resAll.status < 200 || resAll.status >= 300) {
          throw new Error(`拉取所有文章失败: ${resAll.statusText}`);
        }

        // 设置获取到的数据
        setPost(res.data);
        setPosts(resAll.data);

        // 从获取到的单篇文章数据中提取MDX内容（修复了未定义的data变量）
        const mdxContent = res.data.page.properties.Content.rich_text
          .map((item) => item.plain_text)
          .join("");

        // 计算阅读时间
        setReadingTime(calculateReadingTime(mdxContent));

        // 序列化MDX内容
        const serialized = await serialize(mdxContent);
        setMdxSource(serialized);
      } catch (error) {
        // 处理各种可能的错误
        if (error.response) {
          // 服务器返回错误响应
          setError(`请求失败: ${error.response.data.message || error.message}`);
        } else if (error.request) {
          // 请求发出但无响应
          setError("网络错误，无法连接到服务器");
        } else {
          // 其他错误
          setError(error.message);
        }
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

  // 状态管理：是否处于sticky状态
  const [isSticky, setIsSticky] = useState(false);

  // 监听滚动事件，判断是否需要显示文字
  useEffect(() => {
    const handleScroll = () => {
      // 当滚动超过20px时，认为进入sticky状态
      setIsSticky(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Layout
      title={post?.page.properties.Title.title[0]?.plain_text || "载入中..."}
    >
      <div className="sticky top-2 sm:top-4 flex flex-row justify-between z-20">
        <button
          onClick={() => router.push("/thoughts")}
          className={`
        border border-neutral-300/50 dark:border-neutral-700/50 
        bg-background/50 backdrop-blur-lg 
         z-40! cursor-pointer 
        flex items-center 
        rounded-full transition-all duration-300 
        hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50
        ${
          isSticky
            ? "w-22 h-10 px-4 py-2 space-x-2 -translate-x-4 sm:-translate-x-32"
            : "size-10 justify-center"
        }
      `}
        >
          <ArrowLeft size={16} />
          {isSticky && (
            <span className="transition-all duration-300 text-xs truncate overflow-hidden font-medium">
              返回
            </span>
          )}
        </button>
        <TOC
          headings={headings}
          activeHeadingId={activeHeading}
          loading={loading}
          isSticky={isSticky}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, filter: "blur(5px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
      >
        {loading && !error && <Loader />}
        {error && !mdxSource && <Error error={error} />}
        {!loading && mdxSource && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
          >
            <div className="mt-8">
              <h1 className="font-extrabold text-3xl mb-2 text-balance">
                {post.page.properties.Title.title[0]?.plain_text || "未命名"}
              </h1>
              <div className="flex items-center text-xs opacity-75 mb-8">
                <span>
                  {moment(post.page.properties.Date?.date?.start).format(
                    "YYYY年MM月DD日"
                  )}
                </span>
                <span className="mx-2">•</span>
                <span>{readingTime} 分钟阅读</span>
              </div>
              <div
                ref={contentRef}
                className="prose dark:prose-inset max-w-none mt-6 text-base sm:text-lg leading-loose"
              >
                <MDXRemote {...mdxSource} components={components} />
              </div>

              <hr className="my-8 opacity-0" />

              <h1 className="font-bold text-2xl mb-2">所有随想</h1>
              <Post posts={posts} />
              <div className="mb-0" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default PostPage;

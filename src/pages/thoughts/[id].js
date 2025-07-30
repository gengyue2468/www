import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import moment from "moment";
import { ArrowLeft, ZoomInIcon } from "lucide-react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { motion } from "framer-motion";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Post from "@/components/Post";
import axios from "axios";
import { site } from "@/lib/site.config";
import { cn } from "@/lib/utils";

const Img = ({ src, alt, ...props }) => {
  const imageUrl = `${site.cdn}/${src}`;
  const [zoom, setZoom] = useState(false);
  return (
    <div className="my-16 transition-all duration-300">
      <LazyLoadImage
        {...props}
        effect="blur"
        src={imageUrl}
        alt={alt}
        onClick={() => setZoom(zoom ? false : true)}
        placeholderSrc={`${site.cdn}/static/placeholder.webp`}
        className={cn(
          "cursor-pointer w-full h-auto brightness-100",
          zoom ? "rounded-xl" : "rounded-xl "
        )}
      />

      <div className="text-base flex flex-row justify-between items-center mt-1">
        <span className="opacity-50">{alt}</span>
        <button
          onClick={() => setZoom(true)}
          className="flex flex-row space-x-0.5 opacity-50 items-center rounded-full px-4 py-2 cursor-pointer bg-accent hover:bg-accent/50 transition-colors duration-300"
        >
          <ZoomInIcon className="size-6" />
          <span className="ml-0.5">定睛细看</span>
        </button>
      </div>
    </div>
  );
};

const components = {
  h1: ({ children, id }) => (
    <h1 id={id} className="text-lg sm:text-3xl opacity-50 my-8">
      - {children}
    </h1>
  ),
  p: ({ children }) => (
    <p className="my-8 text-lg sm:text-3xl text-balance">{children}</p>
  ),
  a: ({ children, href, target }) => (
    <a
      href={href}
      target={target || "_self"}
      className="text-primary hover:text-primary/80 transition-colors duration-200 border-b border-primary/30 hover:border-primary/60 serif italic"
    >
      {children}
    </a>
  ),
  img: Img,
};

const calculateReadingTime = (content) => {
  const chineseCharsPerMinute = 200;
  const englishWordsPerMinute = 200;

  if (!content) return 0;

  const chineseChars = content.match(
    /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g
  );
  const chineseCount = chineseChars ? chineseChars.length : 0;

  const englishContent = content.replace(
    /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g,
    " "
  );
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


  return (
    <Layout
      title={post?.page.properties.Title.title[0]?.plain_text || "载入中..."}
    >
      <div className="top-2 sm:top-4 flex flex-row justify-between z-20 mb-8">
        <button
          onClick={() => router.push("/thoughts")}
          className="cursor-pointer rounded-full"
        >
          <ArrowLeft className="size-6 sm:size-8 opacity-50" />
        </button>
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
              <h1 className="leading-relaxed text-balance text-3xl sm:text-6xl font-semibold serif mb-4">
                {post.page.properties.Title.title[0]?.plain_text || "未命名"}
              </h1>
              <div className="flex items-center text-lg sm:text-3xl mb-8">
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

              <h1 className="text-lg sm:text-3xl opacity-50 my-4">
                <span className="invisible">-</span> 所有随想
              </h1>

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

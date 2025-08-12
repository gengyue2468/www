import { useBaseFetch } from "./useBaseFetch";
import { fetchApi, processMdxContent, formatError } from "./fetchHelpers";

/**
 * 根据ID获取单篇文章详情及所有文章列表
 * 专门用于PostPage组件，需要id参数
 * @param {string} id - 文章ID
 */
export const useFetchPost = (id) => {
  const { data, loading, error, refetch } = useBaseFetch(async () => {
    // 只在PostPage的Hook中判断id，Home组件的Hook不需要
    if (!id) {
      return { posts: null, post: null, mdxSource: null, readingTime: 0 };
    }

    // 并行请求（优化性能）
    const [posts, post] = await Promise.all([
      fetchApi("../api/notion"),
      fetchApi(`../api/notion/${id}`),
    ]);

    // 处理当前文章的MDX内容
    const { mdxSource, readingTime } = await processMdxContent(post.content);

    return { posts, post, mdxSource, readingTime };
  }, [id]); // 只有需要id的Hook才监听id变化

  return {
    posts: data?.posts || null,
    post: data?.post || null,
    mdxSource: data?.mdxSource || null,
    readingTime: data?.readingTime || 0,
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
};
    
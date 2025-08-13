import { useBaseFetch } from "./useBaseFetch";
import { fetchApi, processMdxContent, formatError } from "./fetchHelpers";

/**
 * 根据ID获取单篇文章详情及所有文章列表
 * 专门用于PostPage组件，需要id参数
 * @param {string} id - 文章ID
 */
export const useFetchPost = (id) => {
  // 定义数据获取函数，接受可选的newId参数
  const fetchData = async (newId) => {
    // 使用传入的newId或当前id
    const currentId = newId || id;
    
    if (!currentId) {
      return { posts: null, post: null, mdxSource: null, readingTime: 0 };
    }

    // 并行请求（优化性能）
    const [posts, post] = await Promise.all([
      fetchApi("../api/notion"),
      fetchApi(`../api/notion/${currentId}`),
    ]);

    // 处理当前文章的MDX内容
    const { mdxSource, readingTime } = await processMdxContent(post.content);

    return { posts, post, mdxSource, readingTime };
  };

  // 使用useBaseFetch，将id作为依赖
  const { data, loading, error, refetch } = useBaseFetch(
    () => fetchData(), 
    [id] // 当id变化时自动重新请求
  );

  // 封装一个带参数的refetch方法，方便外部传入新id
  const refresh = (newId) => {
    return refetch(fetchData(newId));
  };

  return {
    posts: data?.posts || null,
    post: data?.post || null,
    mdxSource: data?.mdxSource || null,
    readingTime: data?.readingTime || 0,
    loading,
    error: error ? formatError(error) : null,
    refetch,      // 原始的refetch方法
    refresh       // 新增的带参数的刷新方法
  };
};

import { useBaseFetch } from "./useBaseFetch";
import { fetchApi, processMdxContent, formatError } from "./fetchHelpers";

/**
 * 获取文章列表及首篇文章详情
 * 不需要id参数，专门用于Home组件
 */
export const useFetchPosts = () => {
  const { data, loading, error, refetch } = useBaseFetch(async () => {
    // 获取所有文章
    const posts = await fetchApi("./api/notion");
    
    if (posts.length === 0) {
      return { posts: [], post: null, mdxSource: null, readingTime: 0 };
    }

    // 处理首篇文章的MDX内容
    const firstPost = posts[0];
    const { mdxSource, readingTime } = await processMdxContent(firstPost.content);

    return { posts, post: firstPost, mdxSource, readingTime };
  });

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
    
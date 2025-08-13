import Layout from "@/components/Layout";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import Wrapper from "@/components/Wrapper";
import { useFetchPost } from "@/lib/hooks/useFetchPost";
import MdxContent from "@/components/MdxContent";
import ViewOnNotion from "@/components/ViewOnNotion";
import { useEffect, useRef } from "react";

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { posts, post, mdxSource, loading, error, readingTime, refresh } =
    useFetchPost(id);
  
  // 记录上一次的id，用于判断是否真的需要刷新
  const lastIdRef = useRef(null);

  useEffect(() => {
    // 防止初始加载和id未变化时的重复请求
    if (id && refresh && id !== lastIdRef.current) {
      lastIdRef.current = id; // 更新记录的id
      refresh(id);
    }
  }, [id, refresh]); // 只依赖id和refresh的变化

  // 防止在loading状态下重复触发请求
  if (loading) {
    return (
      <Layout title="载入中...">
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout title={post?.properties.Title.title[0]?.plain_text || "载入中..."}>
      {error && !mdxSource && <Error error={error} />}
      {mdxSource && (
        <div className="mt-0">
          <Header
            title={post.properties.Title.title[0]?.plain_text}
            date={post.properties.Date?.date?.start}
            desc={post.properties.Desc?.rich_text[0]?.plain_text}
            readingTime={readingTime}
          />
          <Wrapper>
            <MdxContent mdxSource={mdxSource} />
          </Wrapper>

          <ViewOnNotion url={post.public_url} />

          <Footer posts={posts} />
        </div>
      )}
    </Layout>
  );
};

export default PostPage;


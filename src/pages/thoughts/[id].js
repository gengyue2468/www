import Layout from "@/components/Layout";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { MDXRemote } from "next-mdx-remote";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import Wrapper from "@/components/Wrapper";
import { components } from "@/lib/markdown/config";
import { useFetchPost } from "@/lib/hooks/useFetchPost";

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    posts,
    post,
    mdxSource,
    loading,
    error,
    readingTime,
  } = useFetchPost(id);

  return (
    <Layout title={post?.properties.Title.title[0]?.plain_text || "载入中..."}>
      {loading && !error && <Loader />}
      {error && !mdxSource && <Error error={error} />}
      {!loading && mdxSource && (
        <div className="mt-0">
          <Header
            title={post.properties.Title.title[0]?.plain_text}
            date={post.properties.Date?.date?.start}
            desc={post.properties.Desc?.rich_text[0]?.plain_text}
            readingTime={readingTime}
          />
          <Wrapper>
            <MDXRemote {...mdxSource} components={components} />
          </Wrapper>
          <Footer posts={posts} />
        </div>
      )}
    </Layout>
  );
};

export default PostPage;
import Layout from "@/components/Layout";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";
import Footer from "@/components/Footer";
import { useFetchPosts } from "@/lib/hooks/useFetchPosts";
import MdxContent from "@/components/MdxContent";
import ViewOnNotion from "@/components/ViewOnNotion";

const Thoughts = () => {
  const { posts, post, mdxSource, loading, error, readingTime } =
    useFetchPosts();

  return (
    <Layout title="随想">
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
            <MdxContent mdxSource={mdxSource} />
          </Wrapper>

            <ViewOnNotion url={post.public_url} />

          <Footer posts={posts} />
        </div>
      )}
    </Layout>
  );
};

export default Thoughts;

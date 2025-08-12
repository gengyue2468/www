import Layout from "@/components/Layout";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { MDXRemote } from "next-mdx-remote";
import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";
import Footer from "@/components/Footer";
import remarkGfm from "remark-gfm";
import { components } from "@/lib/markdown/config";
import { useFetchPosts } from "@/lib/hooks/useFetchPosts";

const Home = () => {
  const { 
    posts, 
    post, 
    mdxSource, 
    loading, 
    error, 
    readingTime 
  } = useFetchPosts();

  return (
    <Layout title="狗子吃饺子 - I’m thinking">
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
            <MDXRemote
              {...mdxSource}
              components={components}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </Wrapper>

          <Footer posts={posts} />
        </div>
      )}
    </Layout>
  );
};

export default Home;


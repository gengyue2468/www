import Layout from "@/components/Layout";
import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";
import Footer from "@/components/Footer";
import { getLatestPost, getAllPosts } from "@/lib/markdown/getPosts";
import MdxContent from "@/components/MdxContent";

const Home = ({ latestPost, allPosts}) => {
  const { frontmatter, mdxSource, readingTime } = latestPost;
  const { title, date, desc } = frontmatter;
  return (
    <Layout title="狗子吃饺子 - I’m thinking">
      <div className="mt-0">
        <Header
          title={title}
          date={date}
          desc={desc}
          readingTime={readingTime}
        />
        <Wrapper>
          <MdxContent mdxSource={mdxSource} />
        </Wrapper>
        <Footer posts={allPosts} />
      </div>
    </Layout>
  );
};

export default Home;

export async function getStaticProps() {
  const latestPost = await getLatestPost();
  const allPosts = await getAllPosts();

  return {
    props: {
      latestPost,
      allPosts,
    },
  };
}

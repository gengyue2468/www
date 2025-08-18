import Layout from "@/components/Layout";
import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";
import AllPosts from "@/components/AllPosts";
import { getLatestPost, getAllPosts } from "@/lib/markdown/getPosts";
import MdxContent from "@/components/MdxContent";

const Home = ({ latestPost, allPosts}) => {
  const { frontmatter, mdxSource, readingTime } = latestPost;
  const { title, date, desc } = frontmatter;
  return (
    <Layout title="狗子吃饺子 - I’m thinking" desc="这里是狗子吃饺子的个人网站~">
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
        
        <AllPosts posts={allPosts} />
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

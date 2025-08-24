import Layout from "@/components/Layout";
import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";
import AllPosts from "@/components/AllPosts";
import { getLatestPost, getAllPosts } from "@/lib/markdown/getPosts";
import MdxContent from "@/components/MdxContent";
import CommentSystem from "@/components/CommentSystem";

const Home = ({ latestPost, allPosts }) => {
  const { frontmatter, mdxSource, readingTime, slug } = latestPost;
  const { title, date, desc } = frontmatter;
  return (
    <Layout title="B.G - I’m thinking" desc="这里是B.G的个人网站~">
      <span className="opacity-75 font-semibold text-sm">
        你好👋，欢迎访问我的网站，您可以阅读下面的👇最新一篇随想，也可以
        <a>滚动到底部导航栏</a>，或者，按下 Command + K
        呼出导航菜单或者直接点击右上角的图标↗。祝您玩的开心😊
      </span>
      <div className="mt-16">
        <span className="opacity-50 font-medium text-xs text-center flex justify-center mb-4 tracking-widest">
          最新随想
        </span>
        <Header
          title={title}
          date={date}
          desc={desc}
          readingTime={readingTime}
        />
        <Wrapper>
          <MdxContent mdxSource={mdxSource} />
        </Wrapper>
        <CommentSystem slug={slug} />
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

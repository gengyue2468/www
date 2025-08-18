import Layout from "@/components/Layout";
import AllPosts from "@/components/AllPosts";
import { getAllPosts } from "@/lib/markdown/getPosts";

const Whims = ({ allPosts }) => {
  return (
    <Layout title="所有随想" desc="这里是狗子吃饺子的所有随想~">
      <div className="mt-0">
        <AllPosts posts={allPosts} />
      </div>
    </Layout>
  );
};

export default Whims;

export async function getStaticProps() {
  const allPosts = await getAllPosts();

  return {
    props: {
      allPosts,
    },
  };
}

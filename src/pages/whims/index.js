import Layout from "@/components/layouts/Layout";
import AllPosts from "@/components/layouts/AllPosts";
import { getAllPosts } from "@/lib/markdown/getPosts";

const Whims = ({ allPosts }) => {
  return (
    <Layout title="随想" desc="">
      <h1 className="mt-8 mb-4">随想</h1>

      <p>无穷尽的不成熟想法和无心快语</p>

      <AllPosts posts={allPosts} />
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

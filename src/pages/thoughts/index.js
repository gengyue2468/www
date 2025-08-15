import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/markdown/getPosts";

const Thoughts = ({ allPosts }) => {
  return (
    <Layout title="所有随想">
      <div className="mt-0">
        <Footer posts={allPosts} />
      </div>
    </Layout>
  );
};

export default Thoughts;

export async function getStaticProps() {
  const allPosts = await getAllPosts();

  return {
    props: {
      allPosts,
    },
    revalidate: 60 * 60,
  };
}

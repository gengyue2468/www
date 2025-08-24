import Layout from "@/components/Layout";
import AllPosts from "@/components/AllPosts";
import { getAllPosts } from "@/lib/markdown/getPosts";
import Image from "@/components/Image";

const Whims = ({ allPosts }) => {
  return (
    <Layout title="所有随想" desc="这里是狗子吃饺子的所有随想~">
      <div className="mt-0">
        <span className="opacity-75 font-semibold text-sm">
          Peter, I think that you need to poo(pull) again.<sup>1</sup>
        </span>
        <Image src="/static/peter-griffin.webp" alt="Peter Griffin" />{" "}
        <AllPosts posts={allPosts} />
        <span className="opacity-50 font-medium text-xs">
          1. 双关语（Pun）：Poo 和 Pull
          的谐音是精髓所在。Poo（便便）是典型的《恶搞之家》式低级趣味,以及主角
          Peter Griffin 的经典语录，而
          Pull（下拉）则是网站的功能指令。这种不高级但极其有效的谐音梗完美符合该动画的调性。
        </span>
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

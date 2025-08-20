import Layout from "@/components/Layout";
import AllPosts from "@/components/AllPosts";
import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";
import MdxContent from "@/components/MdxContent";
import { getPostBySlug, getAllPosts } from "@/lib/markdown/getPosts";
import CommentSystem from "@/components/CommentSystem";

const WhimPage = ({ post, allPosts }) => {
  const { frontmatter, mdxSource, readingTime, slug } = post;
  const { title, date, desc } = frontmatter;

  return (
    <Layout title={title} desc={desc}>
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

        <CommentSystem slug={slug} />
        <AllPosts posts={allPosts} />
      </div>
    </Layout>
  );
};

export default WhimPage;

export async function getStaticPaths() {
  const posts = await getAllPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}
export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);
  const allPosts = await getAllPosts();

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      allPosts,
    },
  };
}

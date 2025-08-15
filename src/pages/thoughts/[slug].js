import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Wrapper from "@/components/Wrapper";
import MdxContent from "@/components/MdxContent";
import { getPostBySlug, getAllPosts } from "@/lib/markdown/getPosts";

const PostPage = ({ post, allPosts }) => {
  const { frontmatter, mdxSource, readingTime } = post;
  const { title, date, desc } = frontmatter;

  return (
    <Layout title={title || "载入中..."}>
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

export default PostPage;

export async function getStaticPaths() {
  const posts = await getAllPosts();
  const paths = posts.map(post => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: true
  };
}
export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);
  const allPosts = await getAllPosts();

  if (!post) {
    return {
      notFound: true,
      revalidate: 60 * 60
    };
  }

  return {
    props: {
      post,
      allPosts
    },
    revalidate: 60 * 60 
  };
}

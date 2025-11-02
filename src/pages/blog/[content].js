import MdxContent from "@/components/layouts/MdxContent";
import PostLayout from "@/components/layouts/PostLayout";
import Header from "@/components/ui/Header";
import MdxFooter from "@/components/ui/MdxFooter";
import MdxWrapper from "@/components/ui/MdxWrapper";
import { getAllContents } from "@/lib/markdown/getAbout";
import { getAllPosts, getPostBySlug } from "@/lib/markdown/getPosts";

export default function Content({ content, allContents, allPosts }) {
  return (
    <>
      <MdxWrapper>
        <Header
          title={content.frontmatter.title}
          date={content.frontmatter.date}
          readingTime={content.readingTime}
        />
        <MdxContent mdxSource={content.mdxSource} />
      </MdxWrapper>
    </>
  );
}

export async function getStaticPaths() {
  const contents = await getAllPosts();
  const paths = contents.map((post) => ({
    params: { content: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const content = await getPostBySlug(params.content);
  const allContents = await getAllContents();
  const allPosts = await getAllPosts();

  if (!content) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      title: content.frontmatter.title,
      content,
      allContents,
      allPosts,
    },
  };
}

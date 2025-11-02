import { getAllContents } from "@/lib/markdown/getAbout";
import { getAllPosts } from "@/lib/markdown/getPosts";

export default function Error() {
  return (
    <>
      <h1 className="font-semibold text-3xl mt-16">发生意外错误!</h1>
      <p className="font-semibold text-2xl mt-4 opacity-75">An unexpected error has occurred on this server.</p>
    </>
  );
}

export async function getStaticProps() {
  const allPosts = await getAllPosts();
  const allContents = await getAllContents();
  return {
    props: {
      title: "发生意外错误!",
      allPosts,
      allContents,
    },
  };
}

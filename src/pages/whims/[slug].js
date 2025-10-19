import Layout from "@/components/layouts/Layout";
import AllPosts from "@/components/layouts/AllPosts";
import Header from "@/components/layouts/Header";
import Wrapper from "@/components/layouts/Wrapper";
import MdxContent from "@/components/layouts/MdxContent";
import { getPostBySlug, getAllPosts } from "@/lib/markdown/getPosts";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Toc from "@/components/ui/Toc";
import { MenuIcon, SquarePenIcon } from "lucide-react";
import Share from "@/components/ui/Share";
import Drawer from "@/components/ui/Drawer";

const WhimPage = ({ post, allPosts }) => {
  const [toc, setToc] = useState([]);
  const { frontmatter, mdxSource, readingTime, slug } = post;
  const { title, date, desc } = frontmatter;

  useEffect(() => {
    const allTitles = document.getElementsByClassName("anchor-link");
    const titleData = [];
    let currentH1 = null;

    Array.from(allTitles).forEach((title) => {
      const parentElement = title.parentElement;

      if (!parentElement) return;
      const parentTagName = parentElement.tagName;

      if (parentTagName === "H1") {
        const h1Item = {
          title: title.innerText,
          href: title.href,
          subdomains: [],
        };
        titleData.push(h1Item);
        currentH1 = h1Item;
      } else if (parentTagName === "H2" && currentH1) {
        currentH1.subdomains.push({
          title: title.innerText,
          href: title.href,
        });
      }

      setToc(titleData);
    });
  }, [title]);

  const Sidebar = () => {
    return (
      <div className="static lg:sticky top-16 max-h-full overflow-y-auto">
        {toc.length !== 0 && <Toc toc={toc} />}
        <div className="my-4 rounded-3xl bg-neutral-100 dark:bg-neutral-900 px-8 py-6 w-full">
          <Share slug={slug} title={title} />
        </div>
        <div className="my-4 rounded-3xl bg-neutral-100 dark:bg-neutral-900 px-4 py-3 w-full">
          <button
            disabled={true}
            className="disabled:opacity-50 cursor-not-allowed w-full flex flex-row space-x-2 px-4 py-3 items-center hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-3xl transition-all duration-500"
          >
            <div className="rounded-full bg-neutral-200 dark:bg-neutral-800 p-2">
              <SquarePenIcon className="size-6" />{" "}
            </div>
            <span className="font-bold text-xl">撰写评论</span>
          </button>
        </div>
      </div>
    );
  };
  return (
    <Layout title={title} desc={desc}>
      <div>
        <Header
          title={title}
          date={date}
          desc={desc}
          readingTime={readingTime}
        />
        <div className="flex flex-row justify-between gap-8">
          <div className="lg:max-w-lg xl:max-w-3xl w-full px-0 md:px-2 lg:px-0">
            <Wrapper>
              <MdxContent mdxSource={mdxSource} />
            </Wrapper>
            <Drawer content={<Sidebar />}>
              <button className="flex lg:hidden sticky bottom-4 w-32 mx-auto backdrop-blur-3xl bg-neutral-200 dark:bg-neutral-800 rounded-3xl py-3 flex-row justify-center space-x-2 items-center">
                <MenuIcon className="size-4" />
                <span className="font-semibold text-base">打开底栏</span>
              </button>
            </Drawer>
          </div>

          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>

        {/* <CommentSystem slug={slug} /> */}
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

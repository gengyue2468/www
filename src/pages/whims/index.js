import Layout from "@/components/layouts/Layout";
import AllPosts from "@/components/layouts/AllPosts";
import { getAllPosts } from "@/lib/markdown/getPosts";
import { useState } from "react";
import { SearchIcon } from "lucide-react";

const Whims = ({ allPosts }) => {
  const [searchValue, setSearchValue] = useState("");
  const [filterBy,setFilterBy] = useState("标题");

  const filteredPosts = allPosts.filter((item) => {
    return item.frontmatter.title
      ?.toLowerCase()
      .includes(searchValue?.trim().toLowerCase() || "");
  });

  return (
    <Layout title="随想" desc="">
      <h1 className="mt-8 mb-4">随想</h1>

      <p>无穷尽的不成熟想法和无心快语</p>

      <div className="relative">
        <SearchIcon size={16} className="absolute -translate-y-1/2 top-1/2 left-2 text-neutral-800 dark:text-neutral-200" />
        <input
          type="search"
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
          placeholder={`按照${filterBy}筛选随想`}
          className="border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-2 focus:ring-neutral-500 border-sm my-4 w-full pl-8 pr-2 py-2 transition-all duration-500"
        />
      </div>

      <AllPosts posts={filteredPosts} />

      {!filteredPosts.length && <p>没有符合条件的随想，换个关键词再试一次吧</p>}
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

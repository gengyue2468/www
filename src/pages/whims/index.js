import Layout from "@/components/layouts/Layout";
import AllPosts from "@/components/layouts/AllPosts";
import { getAllPosts } from "@/lib/markdown/getPosts";
import { useState } from "react";
import { SearchIcon } from "lucide-react";

const Whims = ({ allPosts }) => {
  const [searchValue, setSearchValue] = useState("");
  const [filterBy, setFilterBy] = useState("标题");

  const filter = ["标题", "内容"];

  const filteredPosts = allPosts.filter((item) => {
    switch (filterBy) {
      case "标题":
        return item.frontmatter.title
          ?.toLowerCase()
          .includes(searchValue?.trim().toLowerCase() || "");
      case "内容":
        return item.content
          ?.toLowerCase()
          .includes(searchValue?.trim().toLowerCase() || "");
    }
  });

  return (
    <Layout title="随想" desc="">
      <h1 className="mt-8 mb-4">随想</h1>

      <p>无穷尽的不成熟想法和无心快语</p>

      <div className="sticky top-8 z-10 -translate-x-4 w-[calc(100%+2rem)]">
        <div className="relative">
          <SearchIcon
            size={16}
            className="absolute -translate-y-1/2 top-1/2 left-2 text-neutral-800 dark:text-neutral-200"
          />
          <input
            type="search"
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            placeholder={`按照${filterBy}筛选随想`}
            className="border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-2 focus:ring-neutral-500 border-sm my-4 w-full pl-8 pr-2 py-2 transition-all duration-500"
          />
        </div>

        <div className="flex flex-row -mt-3 space-x-2 items-center px-4 bg-white dark:bg-black w-full border border-neutral-200 dark:border-neutral-800 py-1">
          <h1 className="!text-xs opacity-50">筛选条件</h1>
          {filter.map((filter, index) => (
            <button
              key={index}
              onClick={() => setFilterBy(filter)}
              className={`rounded-sm px-2 py-1.5 border border-neutral-200 dark:border-neutral-800  ${
                filterBy == filter
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-neutral-100 dark:bg-neutral-900"
              }`}
            >
              按照{filter}筛选
            </button>
          ))}
        </div>
      </div>

      <AllPosts
        posts={filteredPosts}
        filterBy={filterBy}
        searchValue={searchValue}
        type="search"
      />

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

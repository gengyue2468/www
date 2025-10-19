import Layout from "@/components/layouts/Layout";
import AllPosts from "@/components/layouts/AllPosts";
import { getAllPosts } from "@/lib/markdown/getPosts";
import { useState } from "react";
import { ListFilterIcon, SearchIcon } from "lucide-react";

import { InView } from "react-intersection-observer";
import { motion } from "motion/react";

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

  const wordCount = allPosts.reduce((total, curPost) => {
    const singlePostWords = curPost.readingTime[1];

    return total + Number(singlePostWords);
  }, 0);

  const initial = { opacity: 0, y: 20 };
  const animate = { opacity: 1, y: 0 };
  const transition = { type: "tween", ease: "easeOut", duration: 0.6 };

  return (
    <Layout title="随想" desc="">
      <div>
        <div className="my-8 items-center flex flex-col sm:flex-row gap-4 justify-between">
          <InView triggerOnce={true}>
            {({ inView, ref }) => (
              <div ref={ref} className="w-full sm:w-1/2 z-5">
                <motion.h1
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={transition}
                  className="my-8 font-extrabold text-6xl w-full leading-relaxed"
                >
                  随想.
                </motion.h1>

                <motion.h1
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={{ ...transition, delay: 0.2 }}
                  className="my-8 font-extrabold text-4xl w-full leading-relaxed text-balance"
                >
                  <strong>{wordCount}字</strong>的无穷尽的不成熟想法和无心快语
                </motion.h1>
              </div>
            )}
          </InView>

          <div className="w-full sm:w-1/2 -translate-y-32 sm:translate-y-0 z-0">
            <InView triggerOnce={true}>
              {({ ref, inView }) => (
                <motion.img
                  ref={ref}
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={{ ...transition, delay: 0.2 }}
                  src="/static/peter-griffin-removebg-preview.png"
                  className="w-full"
                />
              )}
            </InView>
          </div>
        </div>

        <AllPosts
          posts={filteredPosts}
          filterBy={filterBy}
          searchValue={searchValue}
          type="search"
        />

        {!filteredPosts.length && (
          <p>没有符合条件的随想，换个关键词再试一次吧</p>
        )}
      </div>{" "}
      <div className="max-w-sm mx-auto rounded-3xl px-4 py-2 bg-neutral-100 dark:bg-neutral-900 sticky bottom-10 z-10 backdrop-blur-lg -translate-x-4 w-[calc(100%+2rem)]">
        <div className="relative">
          <SearchIcon
            size={16}
            className="absolute -translate-y-1/2 top-1/2 left-4 text-neutral-800 dark:text-neutral-200"
          />
          <input
            type="search"
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
            placeholder={`按照${filterBy}筛选随想`}
            className="text-base font-medium rounded-full bg-neutral-200 dark:bg-neutral-800 focus:bg-white dark:focus:bg-black focus:outline-none focus:ring-2 focus:ring-neutral-500 border-sm my-4 w-full pl-10 pr-2 py-3 transition-all duration-500"
          />
        </div>{" "}
        <div className="">
          <div className="flex flex-row justify-center space-x-2 items-center px-4 rounded-full bg-white/50 dark:bg-black/50 w-full py-2">
          <ListFilterIcon size={16} />
            {filter.map((filter, index) => (
              <button
                key={index}
                onClick={() => setFilterBy(filter)}
                className={`rounded-full px-3 py-2  ${
                  filterBy == filter
                    ? "bg-black text-white dark:bg-white dark:text-black font-extrabold"
                    : "bg-neutral-100 dark:bg-neutral-900 font-bold"
                }`}
              >
                按照{filter}筛选
              </button>
            ))}
          </div>
        </div>
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

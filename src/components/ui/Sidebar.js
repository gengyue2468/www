import Accordion from "./Accordion";
import { motion } from "motion/react";
import { ListFilter, SearchIcon } from "lucide-react";
import PostList from "./PostList";
import { InView } from "react-intersection-observer";
import { useState } from "react";

export default function Sidebar({ allContents, allPosts }) {
  const [searchValue, setSearchValue] = useState("");

  const filteredContents = allContents.filter((content) => {
    return content.frontmatter.title.includes(
      searchValue?.trim().toLowerCase()
    );
  });

  const filteredPosts = allPosts.filter((post) => {
    return post.frontmatter.title.includes(searchValue?.trim().toLowerCase());
  });

  return (
    <InView>
      {({ inView, ref }) => (
        <motion.div
          ref={ref}
          animate={{ opacity: inView ? 1 : 0 }}
          className="flex flex-col gap-4 justify-between h-full overflow-x-visible relative"
        >
          <div className="flex-1 overflow-x-visible">
            <div className="flex flex-col gap-2 overflow-x-visible">
              <div className="flex flex-col gap-0">
                <Accordion
                  title="内容和信息"
                  content={filteredContents}
                  display="array"
                  empty={!filteredContents.length}
                  type="content"
                />
                <Accordion
                  title="博客归档"
                  content={<PostList post={filteredPosts} />}
                  display="normal"
                  empty={!filteredPosts.length}
                  open={true}
                />
              </div>
            </div>
          </div>
          <div className="w-full sticky bottom-0 translate-y-2 py-4 pl-4 bg-neutral-100 dark:bg-neutral-900">
            <div className="flex flex-row gap-4 items-center">
              <div>
                <ListFilter className="size-5" />
              </div>
              <div className="relative flex-1">
                <SearchIcon className="absolute top-1/2 left-4 -translate-y-1/2 size-5" />
                <input
                  id="filter"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-4 focus:ring-blue-500 dark:focus:ring-blue-600 rounded-2xl pl-12 pr-2 py-3"
                  placeholder="在归档中筛选"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </InView>
  );
}

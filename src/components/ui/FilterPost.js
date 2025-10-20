import { SearchIcon, ListFilterIcon } from "lucide-react";
import { useState } from "react";
import AllPosts from "../layouts/AllPosts";

export default function FilterPost({ allPosts }) {
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
    <div
      style={{
        WebkitScrollbar: "none",
        WebkitScrollbarTrack: "none",
        WebkitScrollbarThumb: "none",
        scrollbarWidth: "none",
      }}
      className="sticky top-20 z-10 w-full md:w-md mx-auto backdrop-blur-lg max-h-[70vh] overflow-y-auto"
    >
      <div className="relative">
        <div className="bg-gradient-to-b from-white dark:from-black to-transparent w-full h-48 top-0 sticky z-10 pointer-events-none" />
        <div className="-mt-48 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-3xl sticky top-0 z-20">
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
        <AllPosts
          posts={filteredPosts}
          filterBy={filterBy}
          searchValue={searchValue}
          type="search"
        />
        <div className="bg-gradient-to-t from-white dark:from-black to-transparent w-full h-48 bottom-0 sticky z-10 pointer-events-none" />
      </div>
    </div>
  );
}

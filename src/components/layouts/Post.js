import moment from "moment";
import { motion } from "motion/react";
import cn from "classnames";
import Wrapper from "./Wrapper";
import { useRouter } from "next/router";
import classNames from "classnames";
import { CalculatorIcon, Calendar1Icon } from "lucide-react";

const groupPostsByDate = (posts) => {
  const grouped = {};

  posts.forEach((post) => {
    const date = post.frontmatter.date;
    if (!date) return;

    const year = moment(date).year();
    const month = moment(date).month();
    const monthName = moment(date).format("MMMM");

    if (!grouped[year]) {
      grouped[year] = {};
    }

    if (!grouped[year][month]) {
      grouped[year][month] = {
        name: monthName,
        posts: [],
      };
    }

    grouped[year][month].posts.push(post);
  });

  return grouped;
};

const MonthTitle = ({ children, className }) => {
  return (
    <h4 className={cn("font-bold text-xl xl:text-2xl my-4 xl:my-8", className)}>
      {children}
    </h4>
  );
};

const PostTitle = ({ children, className }) => {
  return (
    <h1
      className={classNames(
        "font-extrabold text-xl no-underline text-balance",
        className
      )}
    >
      {children}
    </h1>
  );
};

const DayTitle = ({ children }) => {
  return (
    <div className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-3 py-2 flex flex-row gap-2 items-center translate-x-4">
      <Calendar1Icon className="size-5 opacity-50" />
      <h2 className="whitespace-nowrap no-underline! font-bold opacity-50 text-lg">
        {children}
      </h2>
    </div>
  );
};

const ListContainer = ({ children }) => {
  return (
    <div className="flex flex-col w-full gap-4 bg-neutral-100 dark:bg-neutral-900 rounded-3xl p-2">
      {children}
    </div>
  );
};

const FlexContainer = ({ children }) => {
  return (
    <div className="flex flex-row justify-between items-center gap-4 w-full px-6 py-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-3xl transition-all duration-500">
      {children}
    </div>
  );
};

const DisplayContent = ({ content, searchValue }) => {
  const loweredSearchValue = searchValue.trim().toLowerCase();
  const loweredContent = content.toLowerCase();

  const firstIndex = loweredContent.indexOf(searchValue);

  const start = Math.max(0, firstIndex - 10);
  const end = Math.min(content.length, firstIndex + 300);

  const filteredDisplayContent = content.slice(start, end).split("");

  return (
    <>
      {filteredDisplayContent.map((char) =>
        loweredSearchValue.includes(char) ? (
          <strong key={char}>{char}</strong>
        ) : (
          char
        )
      )}
    </>
  );
};

const Post = ({ posts, filterBy, searchValue, type = "display" }) => {
  const router = useRouter();
  moment.locale("zh-cn");
  const groupedPosts = groupPostsByDate(posts);
  const sortedYears = Object.keys(groupedPosts).sort((a, b) => b - a);

  return (
    <div className="z-0">
      {sortedYears.map((year) => {
        const months = groupedPosts[year];
        const sortedMonths = Object.keys(months).sort((a, b) => b - a);
        const isFirstYear = sortedYears.indexOf(year) === 0;

        return (
          <div
            key={year}
            className={`${isFirstYear ? "" : "mt-8"} px-2 pb-4 group`}
          >
            {sortedMonths.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2 px-4 -translate-x-4 w-[calc(100%+2rem)]">
                  <h3
                    className={classNames(
                      "font-extrabold",
                      type === "search"
                        ? "-translate-x-2 text-2xl my-2"
                        : "text-2xl my-4"
                    )}
                  >
                    {year} 年.
                  </h3>
                </div>

                {sortedMonths.map((month) => {
                  const { name: monthName, posts: monthPosts } = months[month];

                  return (
                    <div
                      key={month}
                      className="mb-8 px-2 -translate-x-4 w-[calc(100%+2rem)]"
                    >
                      <MonthTitle
                        className={classNames(
                          "flex px-2",
                          type == "search" &&
                            "text-xl !mt-2 -translate-x-2 mb-4"
                        )}
                      >
                        {monthName}
                      </MonthTitle>
                      <ListContainer>
                        {monthPosts.map((post, index) => {
                          return (
                            <div
                              key={post.slug}
                              index={index}
                              onClick={() =>
                                router.push(`/whims/${post.slug}`, undefined, {
                                  scroll: false,
                                })
                              }
                              className="cursor-pointer w-full transition-all duration-500 group-hover:opacity-50 hover:opacity-100 relative"
                            >
                              <FlexContainer>
                                <PostTitle
                                  className={type === "search" && "!text-xl"}
                                >
                                  {(post.frontmatter.title || "未命名")
                                    .split("")
                                    .map((char, index) => {
                                      if (
                                        searchValue !== "" &&
                                        filterBy === "标题"
                                      ) {
                                        return searchValue
                                          .toLowerCase()
                                          .includes(char.toLowerCase()) ? (
                                          <strong key={index}>{char}</strong>
                                        ) : (
                                          <span key={index}>{char}</span>
                                        );
                                      }
                                      return <span key={index}>{char}</span>;
                                    })}
                                </PostTitle>
                                <DayTitle>
                                  {moment(post.frontmatter.date).format("Do")}
                                </DayTitle>
                              </FlexContainer>
                              {type == "search" && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{
                                    opacity: filterBy === "内容" ? 1 : 0,
                                    height: filterBy === "内容" ? "auto" : 0,
                                  }}
                                  transition={{ duration: 0.5 }}
                                  layout
                                  className="overflow-hidden mt-1 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-3xl px-4 py-2"
                                >
                                  <Wrapper
                                    className={`!mt-0 line-clamp-3 transition-all duration-500`}
                                  >
                                    <DisplayContent
                                      content={post.content}
                                      searchValue={searchValue}
                                    />
                                  </Wrapper>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </ListContainer>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Post;

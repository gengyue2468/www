import moment from "moment";
import Link from "next/link";
import cn from "classnames";
import Wrapper from "./Wrapper";
import { useRouter } from "next/router";

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
    <h4 className={cn("font-bold text-2xl my-8", className)}>{children}</h4>
  );
};

const PostTitle = ({ children }) => {
  return <h1 className="font-extrabold text-2xl no-underline text-balance">{children}</h1>;
};

const DayTitle = ({ children }) => {
  return (
    <h2 className="whitespace-nowrap no-underline! font-bold opacity-50 text-lg">
      {children}
    </h2>
  );
};

const ListContainer = ({ children }) => {
  return <div className="flex flex-row flex-wrap gap-4">{children}</div>;
};

const FlexContainer = ({ children }) => {
  return <div className="flex flex-row justify-between items-center">{children}</div>;
};

const DisplayContent = ({ content, searchValue }) => {
  const loweredSearchValue = searchValue.trim().toLowerCase();
  const loweredContent = content.toLowerCase();

  const firstIndex = loweredContent.indexOf(searchValue);

  const start = Math.max(0, firstIndex);
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
            className={`${
              isFirstYear ? "" : "mt-8"
            } px-2 pb-4 group -translate-x-4 w-[calc(100%+2rem)]`}
          >
            {sortedMonths.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2 px-4 -translate-x-4 w-[calc(100%+2rem)]">
                  <h3 className="text-4xl font-extrabold my-16">{year} 年.</h3>
                </div>
                

                {sortedMonths.map((month) => {
                  const { name: monthName, posts: monthPosts } = months[month];

                  return (
                    <div key={month} className="mb-8 px-2 -translate-x-4 w-[calc(100%+2rem)]">
                      <MonthTitle className="flex px-2">{monthName}</MonthTitle>
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
                              className="cursor-pointer w-full sm:w-96 transition-all duration-500 bg-neutral-100 dark:bg-neutral-900 p-6 group-hover:opacity-50 hover:opacity-100 rounded-3xl relative"
                            >
                              <FlexContainer>
                                <PostTitle>
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
                                <Wrapper
                                  className={`!mt-0 line-clamp-3 transition-all duration-500 ${
                                    filterBy == "内容"
                                      ? "opacity-100 h-18"
                                      : "h-0 opacity-0"
                                  }`}
                                >
                                  <DisplayContent
                                    content={post.content}
                                    searchValue={searchValue}
                                  />
                                </Wrapper>
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

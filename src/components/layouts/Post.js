import moment from "moment";
import Link from "next/link";
import cn from "classnames";

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
  return <h4 className={cn("font-medium text-sm", className)}>{children}</h4>;
};

const PostTitle = ({ children }) => {
  return (
    <h1 className="font-medium text-base sm:text-lg truncate mr-2 no-underline">
      {children}
    </h1>
  );
};

const DayTitle = ({ children }) => {
  return <h2 className="whitespace-nowrap ml-2 text-sm no-underline!">{children}</h2>;
};

const Divider = () => {
  return (
    <div className="h-px flex-grow border-t border-dashed border-neutral-300 dark:border-neutral-700" />
  );
};

const ListContainer = ({ children }) => {
  return <div className="flex flex-col space-y-0 *:">{children}</div>;
};

const FlexContainer = ({ children }) => {
  return <div className="flex items-center ">{children}</div>;
};

const Post = ({ posts }) => {
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
          <div key={year} className={`${isFirstYear ? "" : "mt-8"} px-2 pb-4 group`}>
            {sortedMonths.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2 px-2 -translate-x-4 w-[calc(100%+2rem)]">
                  <h3>
                    {year} 年
                  </h3>
                  <MonthTitle>{months[sortedMonths[0]].name}</MonthTitle>
                </div>

                <ListContainer>
                  {months[sortedMonths[0]].posts.map((post, index) => {
                    return (
                      <div
                        key={post.slug}
                        index={index}
                        className="transition-all duration-500 -translate-x-4 w-[calc(100%+2rem)]  hover:bg-neutral-100 dark:hover:bg-neutral-900 px-2 py-2 group-hover:opacity-50 hover:opacity-100 rounded-sm relative"
                      >
                        <Link scroll={true} href={`/whims/${post.slug}`} className="no-underline! w-full">
                          <FlexContainer>
                            <PostTitle>
                              {post.frontmatter.title || "未命名"}
                            </PostTitle>
                            <Divider />
                            <DayTitle>
                              {moment(post.frontmatter.date).format("Do")}
                            </DayTitle>
                          </FlexContainer>
                        </Link>
                      </div>
                    );
                  })}
                </ListContainer>

                {sortedMonths.slice(1).map((month) => {
                  const { name: monthName, posts: monthPosts } = months[month];

                  return (
                    <div key={month} className="mb-8">
                      <MonthTitle className="flex justify-end px-2 -translate-x-4 w-[calc(100%+2rem)] mt-8 mb-2">
                        {monthName}
                      </MonthTitle>
                      <ListContainer>
                        {monthPosts.map((post, index) => {
                          return (
                            <div
                              key={post.slug}
                              index={index}
                              className="transition-all duration-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 px-2 py-2 -translate-x-4 w-[calc(100%+2rem)] group-hover:opacity-50 hover:opacity-100 rounded-sm relative"
                            >
                              <Link scroll={true} href={`/whims/${post.slug}`} className="no-underline!">
                                <FlexContainer>
                                  <PostTitle>
                                    {post.frontmatter.title || "未命名"}
                                  </PostTitle>
                                  <Divider />
                                  <DayTitle>
                                    {moment(post.frontmatter.date).format("Do")}
                                  </DayTitle>
                                </FlexContainer>
                              </Link>
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

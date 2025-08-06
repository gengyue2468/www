import moment from "moment";
import Link from "next/link";
import { cn } from "@/lib/utils";

const groupPostsByDate = (posts) => {
  // 保持原有分组逻辑不变
  const grouped = {};

  posts.forEach((post) => {
    const date = post.properties.Date?.date?.start;
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
    <h1 className="font-medium text-base sm:text-lg truncate mr-2">
      {children}
    </h1>
  );
};

const DayTitle = ({ children }) => {
  return <h2 className="whitespace-nowrap ml-2 text-sm">{children}</h2>;
};

const Divider = () => {
  return (
    <div className="h-px flex-grow border-t border-dashed border-neutral-300 dark:border-neutral-700" />
  );
};

const ListContainer = ({ children }) => {
  return <div className="mb-8 flex flex-col space-y-0">{children}</div>;
};

const GroupContainer = ({ children, ...props }) => {
  return (
    <div
      {...props}
      className="transition-all duration-300 px-6 py-4 -translate-x-6 w-[calc(100%+3rem)]
                                       group-hover:opacity-50 hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl"
    >
      {children}
    </div>
  );
};

const FlexContainer = ({ children }) => {
  return <div className="flex items-center ">{children}</div>;
};

const Post = ({ posts }) => {
  moment.locale("zh-cn");
  const groupedPosts = groupPostsByDate(posts);
  const sortedYears = Object.keys(groupedPosts).sort((a, b) => b - a);

  return (
    <div className="group w-full my-8">
      {sortedYears.map((year) => {
        const months = groupedPosts[year];
        const sortedMonths = Object.keys(months).sort((a, b) => b - a);
        const isFirstYear = sortedYears.indexOf(year) === 0;

        return (
          <div key={year} className={`${isFirstYear ? "" : "mt-8"} pb-4`}>
            {sortedMonths.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg sm:text-xl">
                    {year} 年
                  </h3>
                  <MonthTitle>{months[sortedMonths[0]].name}</MonthTitle>
                </div>

                {/* 首个月份的文章列表 */}
                <ListContainer>
                  {months[sortedMonths[0]].posts.map((post) => (
                    <GroupContainer>
                      <Link href={`/thoughts/${post.id}`}>
                        <FlexContainer>
                          <PostTitle>
                            {post.properties.Title.title[0]?.plain_text ||
                              "未命名"}
                          </PostTitle>
                          <Divider />
                          <DayTitle>
                            {moment(post.properties.Date?.date?.start).format(
                              "Do"
                            )}
                          </DayTitle>
                        </FlexContainer>
                      </Link>
                    </GroupContainer>
                  ))}
                </ListContainer>

                {/* 其余月份列表 */}
                {sortedMonths.slice(1).map((month) => {
                  const { name: monthName, posts: monthPosts } = months[month];

                  return (
                    <div key={month} className="mb-8">
                      <MonthTitle className="flex justify-end">
                        {monthName}
                      </MonthTitle>
                      <ListContainer>
                        {monthPosts.map((post) => (
                          <GroupContainer>
                            <Link href={`/thoughts/${post.id}`}>
                              <FlexContainer>
                                <PostTitle>
                                  {post.properties.Title.title[0]?.plain_text ||
                                    "未命名"}
                                </PostTitle>
                                <Divider />
                                <DayTitle>
                                  {moment(
                                    post.properties.Date?.date?.start
                                  ).format("Do")}
                                </DayTitle>
                              </FlexContainer>
                            </Link>
                          </GroupContainer>
                        ))}
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

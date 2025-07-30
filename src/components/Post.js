import moment from "moment";
import Link from "next/link";

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

const Post = ({ posts }) => {
  moment.locale('zh-cn');
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
                  <h3 className="text-lg sm:text-3xl opacity-50"><span className="invisible">-</span> {year} 年</h3>
                  <h4 className="font-medium opacity-50">
                    {months[sortedMonths[0]].name}
                  </h4>
                </div>

                {/* 首个月份的文章列表 */}
                <div className="mb-8 flex flex-col space-y-0">
                  {months[sortedMonths[0]].posts.map((post) => (
                    <div 
                      key={post.id} 
                      className="w-full transition-all duration-300 
                                 group-hover:opacity-50 hover:opacity-100 py-0 sm:py-2"
                    >
                      <Link href={`/thoughts/${post.id}`}>
                        <div className="flex items-center w-full py-2.5">
                          <h1 className="text-lg sm:text-3xl mr-2 truncate text-foreground!">
                            - {post.properties.Title.title[0]?.plain_text || "未命名"}
                          </h1>
                          <div className="h-px flex-grow border-t border-dashed border-neutral-600 dark:border-neutral-400" />
                          <h2 className="opacity-50 whitespace-nowrap ml-2 text-foreground!">
                            {moment(post.properties.Date?.date?.start).format("Do")}
                          </h2>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* 其余月份列表 */}
                {sortedMonths.slice(1).map((month) => {
                  const { name: monthName, posts: monthPosts } = months[month];

                  return (
                    <div key={month} className="mb-8">
                      <div className="flex justify-end items-center mb-2">
                        <h4 className="opacity-50 font-medium text-foreground!">{monthName}</h4>
                      </div>
                      <div className="flex flex-col space-y-0 ">
                        {monthPosts.map((post) => (
                          <div
                            key={post.id}
                            className="w-full transition-all duration-300
                                       group-hover:opacity-50 hover:opacity-100 py-0 sm:py-2"
                          >
                            <Link href={`/thoughts/${post.id}`}>
                              <div className="flex items-center w-full">
                                <h1 className="text-lg sm:text-3xl mr-2 truncate text-foreground">
                                  - {post.properties.Title.title[0]?.plain_text || "未命名"}
                                </h1>
                                <div className="h-px flex-grow border-t border-dashed border-neutral-600 dark:border-neutral-400" />
                                <h2 className="opacity-50 whitespace-nowrap ml-2 text-foreground!">
                                  {moment(post.properties.Date?.date?.start).format("Do")}
                                </h2>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
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
    
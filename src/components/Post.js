import moment from "moment";
import Link from "next/link";

const groupPostsByDate = (posts) => {
  const grouped = {};

  posts.forEach((post) => {
    const date = post.properties.Date?.date?.start;
    if (!date) return; // 跳过无日期的文章

    const year = moment(date).year();
    const month = moment(date).month(); // 0-11 的月份值
    const monthName = moment(date).format("MMMM"); // 使用 moment 格式化月份全称

    // 初始化年份分组
    if (!grouped[year]) {
      grouped[year] = {};
    }

    // 初始化月份分组
    if (!grouped[year][month]) {
      grouped[year][month] = {
        name: monthName,
        posts: [],
      };
    }

    // 添加文章到对应月份
    grouped[year][month].posts.push(post);
  });

  return grouped;
};

// 渲染分组后的文章列表
const Post = ({ posts }) => {
  const groupedPosts = groupPostsByDate(posts);
  const sortedYears = Object.keys(groupedPosts).sort((a, b) => b - a); // 倒序排列年份

  return (
    <div className="w-full">
      {sortedYears.map((year) => {
        const months = groupedPosts[year];
        const sortedMonths = Object.keys(months).sort((a, b) => b - a); // 倒序排列月份
        const isFirstYear = sortedYears.indexOf(year) === 0;

        return (
          <div key={year} className={`${isFirstYear ? "" : "mt-8"} pb-4`}>
            {sortedMonths.length > 0 && (
              <>
                {/* 首个月份与年份在同一行 */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{year}</h3>
                  <h4 className="font-medium opacity-80">
                    {months[sortedMonths[0]].name}
                  </h4>
                </div>

                {/* 首个月份的文章列表 */}
                <div className="mb-6">
                  {months[sortedMonths[0]].posts.map((post) => (
                    <div key={post.id} className="w-full">
                      <Link href={`/thoughts/${post.id}`}>
                        <div className="flex items-center w-full">
                          <h1 className="font-medium mr-2 truncate">
                            {post.properties.Title.title[0]?.plain_text ||
                              "Untitled"}
                          </h1>
                          <div className="h-px flex-grow border-t border-dashed border-neutral-300 dark:border-neutral-600" />
                          <h2 className="opacity-75 whitespace-nowrap ml-2">
                            {moment(post.properties.Date?.date?.start).format(
                              "Do"
                            )}
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
                    <div key={month} className="mb-6">
                      <div className="flex justify-end">
                        <h4 className="mb-2 opacity-75 text-lg">{monthName}</h4>
                      </div>
                      <div className="">
                        {monthPosts.map((post) => (
                          <div
                            key={post.id}
                            className="w-full py-2 transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                          >
                            <Link href={`/thoughts/${post.id}`}>
                              <div className="flex items-center w-full">
                                <h1 className="font-medium mr-2 truncate">
                                  {post.properties.Title.title[0]?.plain_text ||
                                    "Untitled"}
                                </h1>
                                <div className="h-px flex-grow border-t border-dashed border-neutral-300 dark:border-neutral-600" />
                                <h2 className="opacity-75 whitespace-nowrap ml-2">
                                  {moment(
                                    post.properties.Date?.date?.start
                                  ).format("Do")}
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

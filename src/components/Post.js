import moment from "moment";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

const groupPostsByDate = (posts) => {
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
  return <div className="flex flex-col space-y-0">{children}</div>;
};

const GroupContainer = ({ children, index, refs, onMouseEnter }) => {
  return (
    <div
      ref={el => refs.current[index] = el}
      onMouseEnter={() => onMouseEnter(index)}
      className="transition-all duration-300 px-6 py-3 -translate-x-6 w-[calc(100%+3rem)]
                                       group-hover:opacity-50 hover:opacity-100 rounded-xl relative z-10"
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
  
  // 用于滑块控制的ref和状态
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const itemRefs = useRef([]);
  const [isHovering, setIsHovering] = useState(false);

  // 初始化滑块位置
  useEffect(() => {
    if (itemRefs.current[0] && sliderRef.current) {
      const firstItem = itemRefs.current[0];
      const { top, height } = firstItem.getBoundingClientRect();
      const containerTop = containerRef.current.getBoundingClientRect().top;

      sliderRef.current.style.top = `${top - containerTop}px`;
      sliderRef.current.style.height = `${height}px`;
      sliderRef.current.style.opacity = "0";
    }
  }, [posts]);

  // 处理鼠标悬停，移动滑块
  const handleMouseEnter = (index) => {
    setIsHovering(true);
    if (!sliderRef.current || !itemRefs.current[index]) return;

    const targetItem = itemRefs.current[index];
    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetItem.getBoundingClientRect();

    const top = targetRect.top - containerRect.top;
    const height = targetRect.height;

    sliderRef.current.style.top = `${top}px`;
    sliderRef.current.style.height = `${height}px`;
    sliderRef.current.style.opacity = "1";
  };

  // 处理鼠标离开，隐藏滑块
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (sliderRef.current) {
      sliderRef.current.style.opacity = "0";
    }
  };

  // 收集所有需要滑块控制的项目
  const getAllItems = () => {
    let items = [];
    sortedYears.forEach(year => {
      const months = groupedPosts[year];
      const sortedMonths = Object.keys(months).sort((a, b) => b - a);
      
      sortedMonths.forEach(month => {
        items = [...items, ...months[month].posts];
      });
    });
    return items;
  };

  const allItems = getAllItems();

  return (
    <div 
      ref={containerRef} 
      className="group w-full mt-2 mb-8 relative inline-flex flex-col"
      onMouseLeave={handleMouseLeave}
    >
      {/* 滑块元素 */}
      <div
        ref={sliderRef}
        className="absolute -left-6 -right-6 rounded-xl bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ease-out z-0"
      />

      {sortedYears.map((year) => {
        const months = groupedPosts[year];
        const sortedMonths = Object.keys(months).sort((a, b) => b - a);
        const isFirstYear = sortedYears.indexOf(year) === 0;

        return (
          <div key={year} className={`${isFirstYear ? "" : "mt-8"} pb-4`}>
            {sortedMonths.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2 px-6 -translate-x-6 w-[calc(100%+3rem)]">
                  <h3 className="font-semibold text-lg sm:text-xl">
                    {year} 年
                  </h3>
                  <MonthTitle>{months[sortedMonths[0]].name}</MonthTitle>
                </div>

                {/* 首个月份的文章列表 */}
                <ListContainer>
                  {months[sortedMonths[0]].posts.map((post) => {
                    const index = allItems.findIndex(item => item.id === post.id);
                    return (
                      <GroupContainer 
                        key={post.id} 
                        index={index}
                        refs={itemRefs}
                        onMouseEnter={handleMouseEnter}
                      >
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
                    );
                  })}
                </ListContainer>

                {/* 其余月份列表 */}
                {sortedMonths.slice(1).map((month) => {
                  const { name: monthName, posts: monthPosts } = months[month];

                  return (
                    <div key={month} className="mb-8">
                      <MonthTitle className="flex justify-end px-6 -translate-x-6 w-[calc(100%+3rem)] mt-14 mb-2">
                        {monthName}
                      </MonthTitle>
                      <ListContainer>
                        {monthPosts.map((post) => {
                          const index = allItems.findIndex(item => item.id === post.id);
                          return (
                            <GroupContainer 
                              key={post.id} 
                              index={index}
                              refs={itemRefs}
                              onMouseEnter={handleMouseEnter}
                            >
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

export default Post

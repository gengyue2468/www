import { useMemo } from "react";
import dayjs from "dayjs";
import Accordion from "./Accordion";
import PostCard from "./PostCard";

export default function PostList({ post }) {
  const postMap = useMemo(() => {
    const targeted = [];
    post.forEach((postItem) => {
      const year = dayjs(postItem.frontmatter?.date).format("YYYY 年");
      const month = dayjs(postItem.frontmatter?.date).format("YYYY 年 M 月");

      if (!year) return;

      let currentYear = targeted.find((y) => y.yearName === year);
      if (!currentYear) {
        currentYear = { yearName: year, yearPost: [] };
        targeted.push(currentYear);
      }

      let currentMonth = currentYear.yearPost.find((m) => m.monthName === month);
      if (!currentMonth) {
        currentMonth = { monthName: month, monthPost: [] };
        currentYear.yearPost.push(currentMonth);
      }
      
      currentMonth.monthPost.push(postItem);
    });
    return targeted;
  }, [post]);

  return (
    <div className="flex flex-col">
      {postMap.map((yearData, index) => (
        <Accordion
          key={yearData.yearName}
          title={yearData.yearName}
          open={true}
          content={yearData.yearPost.map((monthData, monthIndex) => (
            <Accordion
              key={`${yearData.yearName}-${monthData.monthName}`}
              title={monthData.monthName}
              open={false}
              content={monthData.monthPost.map((postItem, postIndex) => (
                <PostCard
                  key={postItem.slug}
                  title={postItem.frontmatter.title}
                  date={postItem.frontmatter.date}
                  readingTime={postItem.readingTime}
                  slug={postItem.slug}
                  type="blog"
                />
              ))}
            />
          ))}
        />
      ))}
    </div>
  );
}
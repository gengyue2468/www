import { groupPostsByYearMonth, type BlogPost } from "#/lib/blog";
import PostListSection from "./post-list-section";

const MONTH_ZH = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

export interface PostTimelineProps {
  posts: BlogPost[];
  className?: string;
}

export default function PostTimeline({ posts, className = "" }: PostTimelineProps) {
  const grouped = groupPostsByYearMonth(posts);
  const timelineClassName = ["page-post-list", "w-full", className].filter(Boolean).join(" ");

  return (
    <div className={timelineClassName}>
      {grouped.flatMap(({ year, months }) =>
        months.map(({ month, posts: monthPosts }, index) => {
          const monthLabel = MONTH_ZH[parseInt(month, 10) - 1] ?? month;

          return (
            <PostListSection
              key={`${year}-${month}`}
              posts={monthPosts}
              sidenote={(
                <>
                  {index === 0 && <span className="block font-medium text-base">{year}</span>}
                  <span className="block">{monthLabel}</span>
                </>
              )}
            />
          );
        }),
      )}
    </div>
  );
}

import { Calendar1Icon, CaseSensitiveIcon, TimerIcon } from "lucide-react";
import moment from "moment";

export default function Header({ title, date, desc, readingTime }) {
  const formattedDate = date
    ? moment(date).format("YYYY 年 MM 月 DD 日")
    : "日期未设置";
  const wordCount =
    readingTime && readingTime[1] > 0 ? `约${readingTime[1]}字` : null;
  const readingTimeText =
    readingTime && readingTime[0] > 0 ? `${readingTime[0]} 分钟阅读` : null;

  return (
    <div className=""> 
    <h1 className="leading-relaxed text-balance my-8 font-extrabold text-5xl sm:text-6xl">
        {title || "未命名文稿"}
      </h1>
      <div className="text-balance text-sm font-semibold opacity-50 flex flex-row flex-wrap gap-4">
        <div className="rounded-3xl bg-neutral-200 dark:bg-neutral-800 px-4 py-3 inline-flex gap-2 items-center">
          <Calendar1Icon className="size-4" />
          <span className="text-xs">最初发布于</span>
          <span>{formattedDate}</span>
        </div>

        <div className="">
          <div className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-4 py-3 inline-flex gap-2 items-center">
            <CaseSensitiveIcon className="size-4" /> <span>{wordCount}</span>
          </div>
        </div>
        <div className="">
          <div className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-4 py-3 inline-flex gap-2 items-center">
            <TimerIcon className="size-4" />
            <span>{readingTimeText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

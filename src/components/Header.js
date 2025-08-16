import moment from "moment";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, PCIcon } from "./Icon";

export default function Header({ title, date, desc, readingTime }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const formattedDate = date
    ? moment(date).format("YYYY 年 MM 月 DD 日")
    : "日期未设置";

  const readingTimeText =
    readingTime && readingTime > 0 ? `${readingTime} 分钟阅读` : null;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <div className="font-medium flex flex-col space-y-2 text-xs sm:text-sm opacity-50">
          <span>{formattedDate}</span>
          <span>{readingTimeText}</span>
        </div>
      </div>

      <h1 className="leading-relaxed text-balance mb-2 font-semibold text-2xl sm:text-3xl">
        {title || "未命名"}
      </h1>

      <h2 className="my-8 text-lg sm:text-xl font-medium text-balance leading-loose">
        {desc}
      </h2>

      <hr className="text-neutral-300 dark:text-neutral-700 my-16 border-dashed" />
    </div>
  );
}

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
        <div className="font-medium flex flex-col space-y-2 text-sm sm:text-base">
          <span>{formattedDate}</span>
          <span>{readingTimeText}</span>
        </div>
        <button
          className="opacity-75 hover:opacity-100 transition-all duration-300 cursor-pointer"
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        >
          {theme === "system" && <PCIcon className="size-5" />}
          {theme === "light" && <SunIcon className="size-5" />}
          {theme === "dark" && <MoonIcon className="size-5" />}
        </button>
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

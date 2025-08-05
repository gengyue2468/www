import moment from "moment";

export default function Header({ title, date, desc, readingTime }) {
  const formattedDate = date
    ? moment(date).format("YYYY年MM月DD日")
    : "日期未设置";

  const readingTimeText =
    readingTime && readingTime > 0 ? `${readingTime} 分钟阅读` : "阅读时间未知";

  return (
    <div>
      <div className="font-medium mb-8 flex flex-col space-y-2 opacity-50">
        <span>{formattedDate}</span>
        <span>{readingTimeText}</span>
      </div>
      <h1 className="leading-relaxed text-balance mb-2 font-semibold text-4xl">
        {title || "未命名"}
      </h1>

      <h2 className="my-8 text-xl sm:text-2xl font-medium text-balance leading-loose">{desc}</h2>

      <hr className="text-neutral-300 dark:text-neutral-700 my-16" />
    </div>
  );
}

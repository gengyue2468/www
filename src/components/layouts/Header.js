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
      <h1 className="leading-relaxed text-balance mt-8 mb-2 font-semibold text-3xl sm:text-4xl">
        {title || "未命名文稿"}
      </h1>

      <div className="text-balance mt-1 text-lg sm:text-xl font-semibold opacity-50 mb-4">
        <span>{formattedDate}</span>
        <br />
        <span>{wordCount}</span>
        <span className="mx-2">·</span>
        <span>{readingTimeText}</span>
      </div>
    </div>
  );
}

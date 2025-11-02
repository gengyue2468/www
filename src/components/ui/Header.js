import dayjs from "dayjs";

export default function Header({ title, date, readingTime }) {
  return (
    <>
      <h1 className="font-semibold text-3xl leading-normal text-balance">{title}</h1>
      <h2 className="!not-prose !text-base font-medium text-neutral-500 mt-8 mb-8">
        最后更新于 {dayjs(date).format("YYYY 年 MM 月 DD 日")} <br />
        全文大约有 {readingTime[1]} 字，大约需要 {readingTime[0]} 分钟阅读
      </h2>
    </>
  );
}

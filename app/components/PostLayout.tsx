import React from "react";
import { Link } from "react-router";
import dayjs from "dayjs";

type NavLink = { slug: string; title: string } | null;

export default function PostLayout({
  title,
  date,
  summary,
  children,
  backTo = "/blog",
  previous,
  next,
  hideHeader = false,
  containerClassName = "max-w-2xl mx-auto px-6 pt-24 pb-16",
  headerCentered = false,
  showSummary = false,
  summaryLabel = "AI 生成的摘要",
}: {
  title?: string;
  date?: string | Date;
  summary?: string | null;
  children?: React.ReactNode;
  backTo?: string | null;
  previous?: NavLink;
  next?: NavLink;
  hideHeader?: boolean;
  containerClassName?: string;
  headerCentered?: boolean;
  showSummary?: boolean;
  summaryLabel?: string;
}) {
  const formattedDate = date ? dayjs(date).format("YYYY 年 MM 月 DD 日") : undefined;
  const titleClass = headerCentered ? "text-3xl font-semibold text-balance max-w-md mx-auto leading-relaxed" : "text-2xl font-semibold";
  const dateClass = headerCentered ? "text-xl my-4 text-neutral-500 font-medium" : "text-sm text-neutral-500";

  return (
    <div className={containerClassName}>
      {!hideHeader && (title || date || (showSummary && summary)) && (
        <header className={headerCentered ? "mb-8 text-center" : "mb-6"}>
          {title && <h1 className={titleClass}>{title}</h1>}
          {date && (
            <p className={dateClass}>{formattedDate ?? String(date)}</p>
          )}

          {showSummary && (
            <>
              <div className="mt-8 mb-6 tracking-widest">* * *</div>
              <span className={headerCentered ? "text-sm my-2 font-medium opacity-50" : "text-sm my-2 font-medium opacity-50"}>
                {summaryLabel}
              </span>
              {summary ? (
                <div className={headerCentered ? "max-w-md mx-auto text-center text-lg italic" : "text-lg italic mt-2"}>
                  {summary}
                </div>
              ) : (
                <div className={headerCentered ? "max-w-md mx-auto text-center text-lg italic" : "text-lg italic mt-2"}>
                  暂无摘要内容。
                </div>
              )}
              <div className="mt-8 mb-8 tracking-widest">* * *</div>
            </>
          )}
        </header>
      )}

      <article className="prose prose-lg prose-stone max-w-full">
        {children}
      </article>

      {(previous || next) && (
        <nav className="mt-16 flex flex-wrap gap-4 justify-between *:no-underline! text-lg">
          {previous ? (
            <Link to={`/blog/${previous.slug}`} className="">
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link to={`/blog/${next.slug}`} className="">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

import React from "react";
import { Link, useLocation } from "react-router";
import dayjs from "dayjs";

type NavLink = { slug: string; title: string } | null;

export default function PostLayout({
  title,
  date,
  summary,
  children,
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
  previous?: NavLink;
  next?: NavLink;
  hideHeader?: boolean;
  containerClassName?: string;
  headerCentered?: boolean;
  showSummary?: boolean;
  summaryLabel?: string;
}) {
  const formattedDate = date
    ? dayjs(date).format("YYYY 年 MM 月 DD 日")
    : undefined;
  const titleClass = headerCentered
    ? "text-4xl font-bold text-balance max-w-2xl mx-auto leading-tight tracking-tight"
    : "text-3xl font-bold tracking-tight";
  const dateClass = headerCentered
    ? "text-lg mt-4 mb-2 text-stone-500 font-normal"
    : "text-sm text-stone-500 mt-3";
  const location = useLocation();

  return (
    <div className={containerClassName}>
      {!hideHeader && (title || date || (showSummary && summary)) && (
        <header className={headerCentered ? "mb-12 text-center" : "mb-10"}>
          {title && (
            <Link to={location.pathname} className="no-underline!">
              <h1 className={titleClass}>{title}</h1>
            </Link>
          )}
          {date && <p className={dateClass}>{formattedDate ?? String(date)}</p>}

          {showSummary && (
            <>
              <div className="mt-10 mb-8 tracking-[0.3em] text-stone-400 text-sm">* * *</div>
              <span
                className="text-xs tracking-wider uppercase text-stone-400 font-medium"
              >
                {summaryLabel}
              </span>
              {summary ? (
                <div
                  className={
                    headerCentered
                      ? "max-w-xl mx-auto text-center text-lg leading-relaxed italic mt-3 text-stone-600"
                      : "text-lg leading-relaxed italic mt-3 text-stone-600"
                  }
                >
                  {summary}
                </div>
              ) : (
                <div
                  className={
                    headerCentered
                      ? "max-w-xl mx-auto text-center text-lg leading-relaxed italic mt-3 text-stone-600"
                      : "text-lg leading-relaxed italic mt-3 text-stone-600"
                  }
                >
                  暂无摘要内容。
                </div>
              )}
              <div className="mt-10 mb-12 tracking-[0.3em] text-stone-400 text-sm">* * *</div>
            </>
          )}
        </header>
      )}

      <article className="prose prose-lg prose-stone max-w-none">
        {children}
      </article>

      {(previous || next) && (
        <>
          <div className="mt-16 mb-10 tracking-[0.3em] text-stone-400 text-sm flex justify-center">
            * * *
          </div>
          <nav className="my-10 flex flex-wrap gap-6 justify-between items-center *:no-underline! text-lg">
            {previous ? (
              <Link
                to={`/blog/${previous.slug}`}
                className="text-stone-600 hover:text-stone-900 transition-colors font-medium"
                prefetch="intent"
              >
                ← {previous.title}
              </Link>
            ) : (
              <span />
            )}

            {next ? (
              <Link to={`/blog/${next.slug}`} className="text-stone-600 hover:text-stone-900 transition-colors font-medium" prefetch="intent">
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </>
      )}

      <div className="mt-12 mb-16 tracking-[0.3em] text-stone-400 text-sm flex justify-center">* * *</div>
    </div>
  );
}

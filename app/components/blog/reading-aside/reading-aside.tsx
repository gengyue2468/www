import {
  ArticleNyTimesIcon,
  CalendarIcon,
  TimerIcon,
  HouseIcon,
  PersonIcon,
  ExportIcon,
  FileArrowUpIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

interface ReadingAsideProps {
  date?: string | Date;
  readingTime?: number;
  wordCount?: number;
  onShare?: () => void;
  onToggleFocus?: () => void;
}

export default function ReadingAside({
  date,
  readingTime,
  wordCount,
  onShare,
  onToggleFocus,
}: ReadingAsideProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(readingTime || 0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollable = documentHeight - windowHeight;
      const progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;

      setScrollProgress(Math.min(progress, 100));

      // 计算剩余阅读时间
      if (readingTime) {
        const remaining = readingTime * (1 - progress / 100);
        setRemainingTime(Math.ceil(remaining));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [readingTime]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (d: string | Date | undefined) => {
    if (!d) return "";
    const date = new Date(d);
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  };

  const pathname = useLocation().pathname;

  return (
    <aside
      className="fixed left-5.5 lg:left-8 top-1/2 -translate-y-1/2 z-50 hidden md:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          will-change-transform cursor-pointer transition-all duration-300
          ${isHovered ? "bg-stone-50 p-1 rounded-lg" : ""}
        `}
      >
        {/* 折叠状态：竖向进度条 */}
        {!isHovered && (
          <div className="w-1 h-32 bg-stone-200 rounded-full relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full bg-linear-to-b from-stone-600 to-stone-900 rounded-t-full transition-all duration-300"
              style={{ height: `${scrollProgress}%` }}
            />
            {/* 当前位置指示点 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-900 rounded-b-full shadow-sm transition-all duration-300"
              style={{ top: `${scrollProgress}%` }}
            />
          </div>
        )}

        {/* 展开状态：详细信息 */}
        {isHovered && (
          <div className="space-y-4 min-w-45">
            {(readingTime || wordCount) && (
              <div className="space-y-0.5 *:px-2 *:py-1 *:rounded-lg *:hover:bg-stone-200/50">
                {remainingTime > 0 && (
                  <div className="flex items-center gap-2 text-base">
                    <span>
                      <TimerIcon className="size-6" />
                    </span>
                    <span>余 {remainingTime} 分</span>
                  </div>
                )}
                {wordCount && (
                  <div className="flex items-center gap-2 text-base">
                    <span>
                      <ArticleNyTimesIcon className="size-6" />
                    </span>
                    <span>{wordCount.toLocaleString()} 字</span>
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-base">
                    <span>
                      <CalendarIcon className="size-6" />
                    </span>
                    <span>{formatDate(date)}</span>
                  </div>
                )}
              </div>
            )}

            {/* 快捷操作 */}
            <div className="flex flex-col items-start *:font-medium *:w-full *:flex *:flex-row *:items-center *:gap-2 *:py-1 *:px-2 *:hover:bg-stone-200/50 *:rounded-lg gap-2 py-2">
              <Link to="/" className="no-underline!">
                <HouseIcon
                  weight={pathname === "/" ? "fill" : "regular"}
                  className="text-stone-900 transition-colors size-6"
                />
                <span>主页</span>
              </Link>
              {/* 关于我 */}
              <Link to="/about" className="no-underline!">
                <PersonIcon
                  weight={pathname === "/about" ? "fill" : "regular"}
                  className="text-stone-900 transition-colors size-6"
                />
                <span>关于</span>
              </Link>{" "}
              {/* 分享 */}
              <button onClick={onShare} className="no-underline!">
                <ExportIcon
                  weight="regular"
                  className="text-stone-900 transition-colors size-6"
                />
                <span>分享</span>
              </button>
              {/* 返回顶部 */}
              <button onClick={scrollToTop} className="no-underline!">
                <FileArrowUpIcon
                  weight="regular"
                  className="text-stone-900 transition-colors size-6"
                />
                <span>顶部</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

import { useState, useRef } from "react";
import moment from "moment";
import { useTheme } from "next-themes";
import { WeiboIcon, QQIcon, EmailIcon, LinkIcon } from "./Icon";

export default function Header({ title, date, desc, readingTime }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showWeiboTip, setShowWeiboTip] = useState(false);
  const linkRef = useRef(null);
  
  const styles = {
    button: "p-2 rounded-full transition-all duration-300 cursor-pointer",
    buttonHover: "hover:bg-neutral-200 dark:hover:bg-neutral-800",
    tooltip: "absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-200 dark:bg-neutral-800 w-24 text-xs px-2.5 py-1.5 rounded-full  transition-opacity duration-300",
    popup: "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300",
    popupContent: "bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl animate-scaleIn max-w-xs w-full"
  };
  
  const formattedDate = date
    ? moment(date).format("YYYY 年 MM 月 DD 日")
    : "日期未设置";

  const readingTimeText =
    readingTime && readingTime > 0 ? `${readingTime} 分钟阅读` : null;

  const handleWeiboShare = () => {
    const url = encodeURIComponent(window.location.href);
    const titleEncoded = encodeURIComponent(`${title || "未命名文稿"} - ${desc}`);
    const shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${titleEncoded}`;
    window.open(shareUrl, '_blank', 'width=615,height=505');
  };

  const handleQQShare = () => {
    const url = encodeURIComponent(window.location.href);
    const titleEncoded = encodeURIComponent(title || "未命名文稿");
    window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${url}&sharesource=qzone&title=${titleEncoded}`, '_blank', 'width=615,height=505');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`分享文章: ${title}`);
    const body = encodeURIComponent(`${title}\n${window.location.href}\n\n${desc}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      linkRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="">
      <div className="font-medium text-sm sm:text-base opacity-75 mb-4">
        <span>{formattedDate}</span>
        <span className="mx-2">·</span>
        <span>{readingTimeText}</span>
      </div>
      <h1 className="leading-relaxed text-balance mb-2 font-semibold text-3xl sm:text-4xl">
        {title || "未命名文稿"}
      </h1>
      <h2 className="my-4 text-base sm:text-lg font-medium text-balance leading-loose">
        {desc}
      </h2>
      <div className="max-w-48 -translate-x-1 flex flex-row justify-between space-x-2 mt-8 relative">
        <button 
          onClick={handleWeiboShare}
          className={`${styles.button} ${styles.buttonHover}`}
          aria-label="微博分享"
        >
          <WeiboIcon className="size-5" />
        </button>
        <button 
          onClick={handleQQShare}
          className={`${styles.button} ${styles.buttonHover}`}
          aria-label="QQ分享"
        >
          <QQIcon className="size-5" />
        </button>
        <button 
          onClick={handleEmailShare}
          className={`${styles.button} ${styles.buttonHover}`}
          aria-label="邮件分享"
        >
          <EmailIcon className="size-5" />
        </button>
        <button 
          onClick={handleCopyLink}
          className={`${styles.button} ${styles.buttonHover} relative`}
          aria-label="复制链接"
        >
          <LinkIcon className="size-5" />
          {copied && (
            <span className={styles.tooltip}>
              已复制链接！
            </span>
          )}
        </button>
        
        <input
          ref={linkRef}
          type="text"
          value={typeof window !== 'undefined' ? window.location.href : ''}
          readOnly
          className="absolute opacity-0 -right-full w-0"
        />
      </div>
      
      <hr className="text-neutral-300 dark:text-neutral-700 my-8" />
      
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

import { CheckIcon, Link2Icon } from "lucide-react";
import { useState } from "react";

export default function Share({ title }) {
  const [copied, setCopied] = useState(false);

  const handleWeiboShare = () => {
    const url = encodeURIComponent(window.location.href);
    const titleEncoded = encodeURIComponent(`${title || "未命名文稿"}`);
    const shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${titleEncoded}`;
    window.open(shareUrl, "_blank", "width=615,height=505");
  };

  const handleQQShare = () => {
    const url = encodeURIComponent(window.location.href);
    const titleEncoded = encodeURIComponent(title || "未命名文稿");
    window.open(
      `https://connect.qq.com/widget/shareqq/index.html?url=${url}&sharesource=qzone&title=${titleEncoded}`,
      "_blank",
      "width=615,height=505"
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      linkRef.current.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-xs mx-auto">
      <h1 className="text-xl text-center">分享这篇文章</h1>

      <div className="flex flex-row justify-between gap-2 mt-4">
        <button
          onClick={handleCopyLink}
          className="rounded-3xl bg-neutral-200 dark:bg-neutral-800 px-6 py-4 flex flex-col items-center justify-center"
        >
          {copied ? (
            <CheckIcon className="size-10" />
          ) : (
            <Link2Icon className="size-10" />
          )}
          <p className="text-xs font-semibold opacity-50">
            {copied ? "已复制！" : "复制链接"}
          </p>
        </button>

        <button
          onClick={handleQQShare}
          className="rounded-3xl bg-neutral-200 dark:bg-neutral-800 px-6 py-4 flex flex-col items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-9"
            viewBox="0 0 448 512"
          >
            <path
              fill="currentColor"
              d="M433.754 420.445c-11.526 1.393-44.86-52.741-44.86-52.741c0 31.345-16.136 72.247-51.051 101.786c16.842 5.192 54.843 19.167 45.803 34.421c-7.316 12.343-125.51 7.881-159.632 4.037c-34.122 3.844-152.316 8.306-159.632-4.037c-9.045-15.25 28.918-29.214 45.783-34.415c-34.92-29.539-51.059-70.445-51.059-101.792c0 0-33.334 54.134-44.859 52.741c-5.37-.65-12.424-29.644 9.347-99.704c10.261-33.024 21.995-60.478 40.144-105.779C60.683 98.063 108.982.006 224 0c113.737.006 163.156 96.133 160.264 214.963c18.118 45.223 29.912 72.85 40.144 105.778c21.768 70.06 14.716 99.053 9.346 99.704"
            />
          </svg>
          <p className="text-xs font-semibold opacity-50">QQ分享</p>
        </button>

        <button
          onClick={handleWeiboShare}
          className="rounded-3xl bg-neutral-200 dark:bg-neutral-800 px-6 py-4 flex flex-col items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-10"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M407 177.6c7.6-24-13.4-46.8-37.4-41.7c-22 4.8-28.8-28.1-7.1-32.8c50.1-10.9 92.3 37.1 76.5 84.8c-6.8 21.2-38.8 10.8-32-10.3M214.8 446.7C108.5 446.7 0 395.3 0 310.4c0-44.3 28-95.4 76.3-143.7C176 67 279.5 65.8 249.9 161c-4 13.1 12.3 5.7 12.3 6c79.5-33.6 140.5-16.8 114 51.4c-3.7 9.4 1.1 10.9 8.3 13.1c135.7 42.3 34.8 215.2-169.7 215.2m143.7-146.3c-5.4-55.7-78.5-94-163.4-85.7c-84.8 8.6-148.8 60.3-143.4 116s78.5 94 163.4 85.7c84.8-8.6 148.8-60.3 143.4-116M347.9 35.1c-25.9 5.6-16.8 43.7 8.3 38.3c72.3-15.2 134.8 52.8 111.7 124c-7.4 24.2 29.1 37 37.4 12c31.9-99.8-55.1-195.9-157.4-174.3m-78.5 311c-17.1 38.8-66.8 60-109.1 46.3c-40.8-13.1-58-53.4-40.3-89.7c17.7-35.4 63.1-55.4 103.4-45.1c42 10.8 63.1 50.2 46 88.5m-86.3-30c-12.9-5.4-30 .3-38 12.9c-8.3 12.9-4.3 28 8.6 34c13.1 6 30.8.3 39.1-12.9c8-13.1 3.7-28.3-9.7-34m32.6-13.4c-5.1-1.7-11.4.6-14.3 5.4c-2.9 5.1-1.4 10.6 3.7 12.9c5.1 2 11.7-.3 14.6-5.4c2.8-5.2 1.1-10.9-4-12.9"
            />
          </svg>
          <p className="text-xs font-semibold opacity-50">微博转发</p>
        </button>
      </div>
    </div>
  );
}

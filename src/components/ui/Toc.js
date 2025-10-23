import classNames from "classnames";
import { ChevronDownIcon, GalleryHorizontalIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Tooltip from "./Tooltip";

export default function Toc({ toc }) {
  const scrollToDestination = (toc) => {
    window.scrollTo({
      top: toc.offsetTop,
      behavior: "smooth",
    });
  };

  const TocButton = ({ toc }) => {
    const [detail, setDetail] = useState(false);
    return (
      <>
        <Tooltip content="跳转到标题">
          <button
            aria-label="跳转到标题"
            onClick={() => scrollToDestination(toc)}
            className="text-left text-balance rounded-3xl px-3 py-2 -translate-x-3 w-[calc(100%+1.5rem)] hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:ring-2  focus:ring-neutral-500 focus:outline-none dark:fill-neutral-800 transition-all duration-500 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg">{toc.title}</h2>
              <Tooltip content="展开副标题">
                <button
                  aria-label="展开副标题"
                  onClick={(e) => {
                    setDetail(!detail);
                    e.stopPropagation();
                  }}
                  className={classNames(
                    "transition-all duration-500 focus:ring-2 focus:ring-neutral-500 bg-neutral-50/50 dark:bg-neutral-950/25 rounded-full size-10 flex justify-center items-center cursor-pointer",
                    detail ? "rotate-180" : "rotate-0",
                    toc.subdomains.length
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  )}
                >
                  <ChevronDownIcon size={24} />
                </button>
              </Tooltip>
            </div>
          </button>
        </Tooltip>

        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: detail ? "auto" : 0,
            opacity: detail ? 1 : 0,
          }}
          layout
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
          className="flex flex-col space-y-1 overflow-y-hidden -translate-x-3 w-[calc(100%+1.5rem)] mb-1"
        >
          {toc.subdomains?.map((sub, index) => (
            <Tooltip content="跳转到副标题" key={index}>
              <button
                aria-label="跳转到副标题"
                onClick={() => scrollToDestination(sub)}
                className="text-left rounded-3xl px-3 py-4 w-full hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-black dark:focus:bg-white focus:*:!text-white dark:focus:*:!text-black transition-all duration-500 cursor-pointer"
              >
                <motion.h2
                  className="text-base !font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: detail ? 1 : 0, y: detail ? 0 : -10 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <span className="opacity-50 mono">{index + 1}.</span>
                  <span>{sub.title}</span>
                </motion.h2>
              </button>
            </Tooltip>
          ))}
        </motion.div>
      </>
    );
  };

  return (
    <div
      className="rounded-3xl bg-neutral-100 dark:bg-neutral-900 w-full md:max-h-[24rem] sm:max-h-[30rem] overflow-y-auto"
      style={{
        WebkitScrollbar: "none",
        WebkitScrollbarTrack: "none",
        WebkitScrollbarThumb: "none",
        scrollbarWidth: "none",
      }}
    >
      <div className="sticky top-0 bg-neutral-100 dark:bg-neutral-900 z-10 px-8 py-4">
        <div className="flex flex-row gap-2 justify-between items-center">
          <h1 className="text-xl">目录</h1>
          <Tooltip content="目录需要上下滚动以完全展示">
            <div className="font-semibold opacity-50 flex flex-row gap-1 items-center cursor-help">
              <GalleryHorizontalIcon className="size-5" />
              <span className="text-xs">上下滚动</span>
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col space-y-1 px-8">
        {toc.map((toc, index) => {
          return (
            <div key={index}>
              <TocButton toc={toc} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

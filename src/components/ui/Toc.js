import classNames from "classnames";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Toc({ toc }) {
  const router = useRouter();

  const TocButton = ({ toc }) => {
    const [detail, setDetail] = useState(false);
    return (
      <>
        <button
          onClick={() => router.push(toc.href)}
          className="text-left text-balance rounded-full px-3 py-2 -translate-x-3 w-[calc(100%+1.5rem)] hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-500 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg">{toc.title}</h2>
            <button
              onClick={(e) => {
                setDetail(!detail);
                e.stopPropagation();
              }}
              className={classNames(
                "transition-all duration-500 bg-neutral-50/50 dark:bg-neutral-950/25 rounded-full size-10 flex justify-center items-center cursor-pointer",
                detail ? "rotate-180" : "rotate-0"
              )}
            >
              <ChevronDownIcon size={24} />
            </button>
          </div>
        </button>
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
          className="flex flex-col space-y-1"
        >
          {toc.subdomains?.map((sub, index) => (
            <div
              key={index}
              onClick={() => router.push(sub.href)}
              className="rounded-full px-3 py-3 -translate-x-3 w-[calc(100%+1.5rem)] hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all duration-300 cursor-pointer"
            >
              <motion.h2
                className="text-base !font-semibold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: detail ? 1 : 0, y: detail ? 0 : -10 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                {sub.title}
              </motion.h2>
            </div>
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
        <h1 className="text-xl">文章目录</h1>
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

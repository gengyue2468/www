import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Loader from "./Loader";
import { cn } from "@/lib/utils";

export default function TOC({ headings, activeHeadingId, loading, isSticky }) {
  // 使用更直观的状态名：isLargeDevice
  const [isLargeDevice, setIsLargeDevice] = useState(window.innerWidth >= 768);

  // 用于存储当前打开的面板值
  const [activePanel, setActivePanel] = useState(isLargeDevice ? "toc" : "");

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const newIsLargeDevice = window.innerWidth >= 768;
      setIsLargeDevice(newIsLargeDevice);

      // 根据设备尺寸变化自动设置打开的面板
      setActivePanel(newIsLargeDevice ? "toc" : "");
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const itemVariants = {
    open: { y: 0 },
    closed: { y: -10 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.25 }}
      className={cn(
        "right-0 bg-background/50 backdrop-blur-lg transition-all rounded-3xl duration-300 border border-neutral-300/50 dark:border-neutral-700/50 px-4 py-2",
        isSticky
          ? "translate-x-4 sm:translate-x-96 w-64 min-h-10 "
          : "rounded-ful w-48 sm:w-64 min-h-10"
      )}
    >
      {loading === false && (
        <Accordion
          type="single"
          collapsible
          value={activePanel}
          onValueChange={setActivePanel}
        >
          <AccordionItem value="toc">
            <AccordionTrigger className="border-none text-xs">
              目录
            </AccordionTrigger>
            <AccordionContent className="flex flex-col space-y-1.5">
              {!headings.length && loading && <Loader />}
              {!headings.length && (
                <span className="text-center text-xs opacity-50 my-8">
                  没有目录
                </span>
              )}
              <div className="mt-1" />
              {headings &&
                headings.map((heading) => (
                  <motion.a
                    key={heading.inlineText}
                    href={`#${heading.inlineText}`}
                    variants={itemVariants}
                    className={cn(
                      "text-xs hover:bg-background! no-underline! text-foreground border-none",
                      heading.id === activeHeadingId
                        ? "text-primary font-medium opacity-100 transition-all duration-500 "
                        : "opacity-50"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                  >
                    {heading.text}
                  </motion.a>
                ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2"></AccordionItem>
        </Accordion>
      )}
    </motion.div>
  );
}

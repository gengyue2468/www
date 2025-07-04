import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Loader from "./Loader";

export default function TOC({ headings, activeHeadingId }) {
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
      setActivePanel(newIsLargeDevice ? "item-1" : "");
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
      className="fixed sm:sticky bottom-0 sm:right-0 sm:top-16 px-6 w-full bg-background/75 backdrop-blur-lg transition-all duration-500"
    >
      <Accordion type="single" collapsible value={activePanel}>
        <AccordionItem value="toc">
          <AccordionTrigger className="py-2.5 sm:py-3">
            Table of Contents
          </AccordionTrigger>
          <AccordionContent className="flex flex-col space-y-1">
            {!headings.length && <Loader />}
            {headings.length &&
              headings.map((heading) => (
                <motion.a
                  key={heading.inlineText}
                  href={`#${heading.inlineText}`}
                  variants={itemVariants}
                  className={`block pl-${(heading.level - 1) * 4} ${
                    heading.id === activeHeadingId
                      ? "text-primary text-sm font-medium opacity-100 transition-all duration-500"
                      : "opacity-50"
                  }`}
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
    </motion.div>
  );
}

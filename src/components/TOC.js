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
  const [activePanel, setActivePanel] = useState("");


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
        "right-0 bg-accent/50 transition-all duration-300 backdrop-blur-lg rounded-3xl px-4 py-2",
        isSticky
          ? "translate-x-2 sm:translate-x-96 w-64 min-h-10 "
          : "rounded-ful w-48 sm:w-64 min-h-10"
      )}
    >
      {loading === false && (
        <Accordion
          type="single"
          collapsible
          value={activePanel}
          onValueChange={setActivePanel}
          className="opacity-50"
        >
          <AccordionItem value="toc">
            <AccordionTrigger className="text-base border-none mt-0">
              目录
            </AccordionTrigger>
            <AccordionContent className="flex flex-col space-y-1.5">
              {!headings.length && loading && <Loader />}
              {!headings.length && (
                <span className="text-base text-center opacity-50 my-8">
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
                      "text-base no-underline! text-foreground border-none",
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

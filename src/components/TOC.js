import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TOC({ headings, activeHeadingId }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(5px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.25 }}
      className="fixed sm:sticky bottom-0 sm:right-0 sm:top-16 px-4 bg-background/75 backdrop-blur-lg w-full py-1 sm:py-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Table of Contents</h2>
        <Button
          onClick={() => setOpen(!open)}
          variant="ghost"
          className="cursor-pointer"
        >
          {open ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </Button>
      </div>

      <div
        className={cn(
          "space-y-1 transition-all duration-500 overflow-hidden",
          open ? "opacity-100" : "h-0 opacity-0"
        )}
      >
        {headings.map((heading) => (
          <a
            key={heading.inlineText}
            href={`#${heading.inlineText}`}
            className={`block pl-${(heading.level - 1) * 4} py-1 ${
              heading.id === activeHeadingId
                ? "text-primary font-medium transition-all duration-500"
                : "opacity-75 hover:opacity-100"
            }`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </motion.div>
  );
}

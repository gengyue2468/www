import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export default function TOC({ headings, activeHeadingId }) {
  const [open, setOpen] = useState(false);
  const isFirstMount = useRef(true);
  useEffect(() => {
    const isSmallDevice = window.innerWidth < 768;

    if (isFirstMount.current) {
      setOpen(!isSmallDevice);
      isFirstMount.current = false;
      return;
    }
    if (open === !isSmallDevice) return;
    setOpen(!isSmallDevice);
  }, []);
  useEffect(() => {
    const handleResize = () => {
      const isSmallDevice = window.innerWidth < 768;
      if (open === isSmallDevice) {
        setOpen(!isSmallDevice);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  const collapseVariants = {
    open: {
      opacity: 1,
      maxHeight: 9999,
      margin: "8px 0",
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
      },
    },
    closed: {
      opacity: 0,
      maxHeight: 0,
      margin: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        delay: 0,
      },
    },
  };

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
      {headings && (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-sm">Table of Contents</h2>
          <Button
            onClick={() => setOpen(!open)}
            variant="ghost"
            className="visible sm:hidden cursor-pointer rounded-full p-0.5 size-10"
          >
            {open ? <ChevronUpIcon size={10} /> : <ChevronDownIcon size={10} />}
          </Button>
        </div>
      )}

      <motion.div
        variants={collapseVariants}
        initial={false}
        animate={open ? "open" : "closed"}
        className="space-y-2 text-sm overflow-hidden"
      >
        {headings &&
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
      </motion.div>
    </motion.div>
  );
}

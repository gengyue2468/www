import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronRightIcon, ListIcon } from "lucide-react";
import PostCard from "./PostCard";
import classNames from "classnames";

export default function Accordion({
  title,
  content,
  type,
  display = "normal",
  open = false,
  empty,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(open);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRendered(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (empty) {
      setIsOpen(true);
    }
  }, [empty]);

  return (
    <motion.div layout {...props}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        className={classNames(
          "whitespace-nowrap truncate hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white rounded-lg p-2 flex flex-row gap-2 items-center w-full",
          isOpen && "bg-neutral-200 dark:bg-neutral-800"
        )}
      >
        <span>
          <ChevronRightIcon
            className={classNames(
              "size-5 transition-transform duration-300",
              isOpen && "rotate-90"
            )}
          />
        </span>
        <span>
          <ListIcon className="size-5 opacity-75" />
        </span>
        <h1 className="font-medium">{title}</h1>
      </motion.button>
      <motion.div
        className="overflow-hidden my-1"
        initial={{ height: isOpen ? "auto" : 0 }}
        animate={rendered ? { height: isOpen ? "auto" : 0 } : false}
        transition={{ duration: !rendered ? 0 : 0.3}}
        layout
      >
        {display == "array"
          ? content?.map((post, index) => (
              <PostCard
                title={post.frontmatter.title}
                date={post.frontmatter.date}
                key={index}
                slug={post.slug}
                type={type}
              />
            ))
          : content}
        {empty && <span className="opacity-75 pl-9 py-4">没有归档</span>}
      </motion.div>
    </motion.div>
  );
}

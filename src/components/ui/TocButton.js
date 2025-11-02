import { motion } from "motion/react";
import classNames from "classnames";
import { DotIcon, TableOfContentsIcon } from "lucide-react";

export default function TocButton({
  heading,
  offsetTop,
  type,
  index,
  active,
  ...props
}) {
  return (
    <motion.button
      onClick={() => scrollTo({ top: offsetTop - 50, behavior: "smooth" })}
      whileTap={{ scale: 0.95 }}
      className={classNames(
        "hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white rounded-lg p-2 flex flex-row gap-2 items-center w-full",
        type == "subheading" && "pl-9",
        active && "bg-neutral-200 dark:bg-neutral-800"
      )}
      {...props}
    >
      <span className="font-semibold text-sm opacity-75">{index + 1}.</span>
      <h1 className="font-medium whitespace-nowrap truncate">{heading}</h1>
    </motion.button>
  );
}

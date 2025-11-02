import classNames from "classnames";
import { motion } from "motion/react";

export default function NavButton({ children, className, ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={classNames(
        "hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg p-2 transition-all duration-300 items-center",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LinkIcon } from "./Icon";
import { motion } from "motion/react";

const NextLink = ({ href, children, ...props }) => {
  const isExternal =
    (typeof href === "string" &&
      (href.startsWith("http://") || href.startsWith("https://"))) ||
    href.startsWith("mailto:");

  const [isHovered, setIsHovered] = useState(false);

  const baseStyles =
    "relative inline-flex items-center font-medium transition-all duration-300 not-prose";

  const textStyles = "relative z-10 transition-colors duration-300";

  const backgroundStyles = `absolute z-[-1] inset-0 px-1 py-0.5 -translate-x-2 rounded-lg transform origin-center bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ease-out`;

  const initialOffset = 25;
  const initialWidth = "50%";
  const initialHeight = "75%";

  const initialState = {
    opacity: 0,
    y: initialOffset,
    width: initialWidth,
    height: initialHeight,
  };

  const activeState = {
    opacity: 1,
    y: 0,
    width: "calc(100% + 1rem)",
    height: "100%",
  };

  const transition = {
    type: "spring",
    stiffness: 400,
    damping: 35,
    duration: 0.3,
  };

  const animateTarget = isHovered ? activeState : initialState;

  if (!isExternal) {
    return (
      <Link
        href={href}
        {...props}
        scroll={true}
        className={baseStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.span
          className={backgroundStyles}
          initial={initialState}
          animate={animateTarget}
          transition={transition}
        />

        <span className={textStyles}>{children}</span>
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      className={baseStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className={backgroundStyles}
        initial={initialState}
        animate={animateTarget}
        transition={transition}
      />

      <span className={cn(textStyles, "flex flex-row items-center")}>
        {children}
        <span className="ml-1 size-4 flex justify-center items-center bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded-sm">
          <LinkIcon className="size-3" />
        </span>
      </span>
    </a>
  );
};

export default NextLink;

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LinkIcon } from "./Icon";

const NextLink = ({ href, children, ...props }) => {
  const isExternal =
    (typeof href === "string" &&
      (href.startsWith("http://") || href.startsWith("https://"))) ||
    href.startsWith("mailto:");

  const [isHovered, setIsHovered] = useState(false);

  const baseStyles =
    "relative inline-flex items-center font-medium transition-all duration-300 not-prose";

  const textStyles = "relative z-10 transition-colors duration-300";

  const backgroundStyles = `absolute z-[-1] inset-0 px-1 py-0.5 -translate-x-2 w-[calc(100%+1rem)] rounded-md transform scale-0 origin-left bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 ease-out ${
    isHovered ? "scale-100" : "scale-0"
  }`;

  if (!isExternal) {
    return (
      <Link
        href={href}
        {...props}
        className={baseStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className={backgroundStyles} />

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
      <span className={backgroundStyles} />

      <span className={cn(textStyles, "flex flex-row items-center")}>
        {children}
        <span className="ml-1">
          <LinkIcon className="size-4" />
        </span>
      </span>
    </a>
  );
};

export default NextLink;

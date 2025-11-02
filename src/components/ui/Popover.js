import classNames from "classnames";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function Popover({ children, content }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  const checkClick = (e) => {
    if (!popoverRef.current) return;

    const isOutside = !popoverRef.current.contains(e.target);
    if (isOutside) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", checkClick);
    return () => {
      document.removeEventListener("click", checkClick);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <div onClick={() => setOpen(!open)}>{children}</div>
      <motion.div
        initial={{ opacity: 0, h: 0, y: -20 }}
        animate={{
          opacity: open ? 1 : 0,
          h: open ? "auto" : 0,
          y: open ? 0 : -20,
        }}
        layout
        className={classNames(
          "overflow-hidden w-max absolute -translate-x-1/2 left-1/2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl top-10 px-8 py-6",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {content}
      </motion.div>
    </div>
  );
}

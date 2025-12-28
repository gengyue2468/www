import { useRef, useEffect, useState } from "react";

interface MagneticTextProps {
  text: string | React.ReactNode;
  className?: string;
}

export default function MagneticText({ text, className }: MagneticTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleEnter = () => {
      setHovered(true);
      const rect = el.getBoundingClientRect();
      window.__setCursorTarget?.({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    };

    const handleLeave = () => {
      setHovered(false);
      window.__setCursorTarget?.(null);
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <span
      ref={ref}
      className={`relative inline-block cursor-none ${
        hovered ? "text-white dark:text-black" : ""
      } ${className}`}
    >
      {text}
    </span>
  );
}

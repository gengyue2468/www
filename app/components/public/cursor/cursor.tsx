import { motion, useMotionValue, useSpring } from "framer-motion";
import { use, useEffect, useState } from "react";

export interface CursorTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Cursor() {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorW = useMotionValue(20);
  const cursorH = useMotionValue(20);
  const cursorRadius = useMotionValue(999);

  const springX = useSpring(cursorX, { stiffness: 400, damping: 25 });
  const springY = useSpring(cursorY, { stiffness: 400, damping: 25 });
  const springW = useSpring(cursorW, { stiffness: 400, damping: 25 });
  const springH = useSpring(cursorH, { stiffness: 400, damping: 25 });

  const [target, setTarget] = useState<CursorTarget | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    window.__cursorX = cursorX;
    window.__cursorY = cursorY;
    window.__cursorW = cursorW;
    window.__cursorH = cursorH;
    window.__cursorRadius = cursorRadius;
    window.__setCursorTarget = setTarget;

    const handleMouseMove = (e: MouseEvent) => {
      if (!target) {
        cursorX.set(e.clientX - 10);
        cursorY.set(e.clientY - 10);
        cursorW.set(isPressed ? 16 : 20);
        cursorH.set(isPressed ? 16 : 20);
        cursorRadius.set(999);
      } else {
        cursorX.set(target.x - 4);
        cursorY.set(target.y - 4);
        cursorW.set(target.width + 8);
        cursorH.set(target.height + 8);
        cursorRadius.set(8);
      }
    };

    const handleMouseDown = () => {
      setIsPressed(true);
      if (!target) {
        cursorW.set(16);
        cursorH.set(16);
      }
    };

    const handleMouseUp = () => {
      setIsPressed(false);
      if (!target) {
        cursorW.set(20);
        cursorH.set(20);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [target, isPressed]);

  const cursorClass = target
    ? "bg-neutral-900 dark:bg-neutral-100 mix-blend-difference z-0"
    : "bg-neutral-900 dark:bg-neutral-100 mix-blend-difference z-50";

  return (
    <motion.div
      className={`fixed top-0 left-0 pointer-events-none rounded-full ${cursorClass}`}
      style={{
        x: springX,
        y: springY,
        width: springW,
        height: springH,
        borderRadius: cursorRadius,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    />
  );
}

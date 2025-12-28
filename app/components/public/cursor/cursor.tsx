import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export interface CursorTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Cursor() {
  const [enabled, setEnabled] = useState(true);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorW = useMotionValue(20);
  const cursorH = useMotionValue(20);
  const cursorRadius = useMotionValue(999);
  const cursorOpacity = useMotionValue(0);

  const springX = useSpring(cursorX, { stiffness: 400, damping: 25 });
  const springY = useSpring(cursorY, { stiffness: 400, damping: 25 });
  const springW = useSpring(cursorW, { stiffness: 400, damping: 25 });
  const springH = useSpring(cursorH, { stiffness: 400, damping: 25 });
  const springOpacity = useSpring(cursorOpacity, { stiffness: 400, damping: 25 });

  const [target, setTarget] = useState<CursorTarget | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const location = useLocation();

  // 移动端禁用
  useEffect(() => {
    if (typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setEnabled(false);
    }
  }, []);

  // 页面加载或路由切换时初始化 cursor 状态
  useEffect(() => {
    if (!enabled) return;

    // 尝试读取初始鼠标位置
    const initX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    const initY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

    cursorX.set(initX - 10);
    cursorY.set(initY - 10);
    cursorW.set(20);
    cursorH.set(20);
    cursorRadius.set(999);
    cursorOpacity.set(0);

    setTarget(null);
    setIsPressed(false);

    // 若鼠标已在窗口内，监听第一次移动更新位置
    const handleMouseMoveOnce = (e: MouseEvent) => {
      cursorX.set(e.clientX - 10);
      cursorY.set(e.clientY - 10);
      window.removeEventListener("mousemove", handleMouseMoveOnce);
    };
    window.addEventListener("mousemove", handleMouseMoveOnce);

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveOnce);
    };
  }, [location, enabled]);

  // 主逻辑：移动、按下、释放、闲置隐藏
  useEffect(() => {
    if (!enabled) return;

    window.__cursorX = cursorX;
    window.__cursorY = cursorY;
    window.__cursorW = cursorW;
    window.__cursorH = cursorH;
    window.__cursorRadius = cursorRadius;
    window.__setCursorTarget = setTarget;

    let idleTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      // 控制光标显示与隐藏
      if (!target) {
        cursorOpacity.set(1);
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(() => {
          cursorOpacity.set(0);
        }, 2000);
      } else {
        // 吸附状态保持显示
        cursorOpacity.set(1);
      }

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
      clearTimeout(idleTimeout);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [target, isPressed, enabled]);

  if (!enabled) return null;

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
        opacity: springOpacity,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    />
  );
}

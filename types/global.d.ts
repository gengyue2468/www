import { MotionValue } from "framer-motion";

declare global {
  interface Window {
    __cursorX?: MotionValue<number>;
    __cursorY?: MotionValue<number>;
    __cursorW?: MotionValue<number>;
    __cursorH?: MotionValue<number>;
    __cursorRadius?: MotionValue<number>;
    __cursorBg?: MotionValue<string>;
    __setCursorTarget?: (target: CursorTarget | null) => void;
  }
}

export interface CursorTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

export {};
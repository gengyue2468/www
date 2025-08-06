import { Loader2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/router";

export default function Loader({ type, word }) {
  const router = useRouter();
  return (
    <div className="mt-16 mb-96 text-base">
      <div className="flex flex-row space-x-1.5 items-center">
        <Loader2Icon size={18} className="animate-spin" />{" "}
        <span className="">
          {type !== "no-notion" ? "连接 Notion..." : `${word}加载中...`}
        </span>
      </div>
    </div>
  );
}

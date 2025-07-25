import { Loader2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/router";

export default function Loader({ type, word }) {
  const router = useRouter();
  return (
    <div className="animate-pulse my-32">
      <div className="flex flex-col space-y-1.5 items-center">
        <Loader2Icon size={36} className="animate-spin" />{" "}
        <span className="opacity-75 text-xs">
          {type !== "no-notion" ? "连接 Notion..." : `${word}加载中...`}
        </span>{" "}
        <motion.small
          className="opacity-75 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 9 }}
        >
          加载时间过长？试试
          <button onClick={router.reload} className="underline cursor-pointer">
            重载页面.
          </button>
        </motion.small>
      </div>
    </div>
  );
}

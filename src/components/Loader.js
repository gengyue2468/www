import { Loader2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/router";

export default function Loader({ type, word }) {
  const router = useRouter();
  return (
    <div className="animate-pulse my-32 text-xs">
      <div className="flex flex-col space-y-1.5 items-center">
        <Loader2Icon size={16} className="animate-spin" />{" "}
        <span className="opacity-50">
          {type !== "no-notion" ? "连接 Notion..." : `${word}加载中...`}
        </span>{" "}
        <motion.p
          className="opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 9 }}
        >
          加载时间过长？试试
          <button onClick={router.reload} className="underline cursor-pointer">
            重载页面.
          </button>
        </motion.p>
      </div>
    </div>
  );
}

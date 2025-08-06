import { Loader2Icon } from "lucide-react";
import Image from "./Image";

export default function Loader({ type, word }) {
  return (
    <div className="mt-16 mb-24 text-sm sm:text-base font-medium">
      <div className="flex flex-row space-x-1.5 items-center">
        <Loader2Icon size={18} className="animate-spin" />{" "}
        <span className="">
          {type !== "no-notion" ? "连接 Notion..." : `${word}加载中...`}
        </span>
      </div>
      <Image
        src="https://uapis.cn/api/bing.php"
        alt="等待是长跑，不是短跑 —— 威尔・史密斯。"
      />
    </div>
  );
}

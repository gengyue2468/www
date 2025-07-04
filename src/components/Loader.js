import { Loader2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/router";

export default function Loader() {
  const router = useRouter();
  return (
    <div className="animate-pulse">
      <div className="flex flex-row space-x-1.5 items-center">
        <Loader2Icon size={16} className="animate-spin" />{" "}
        <span className="opacity-75">Connecting Notion...</span>
      </div>
      <motion.small
        className="opacity-75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ delay: 9 }}
      >
        The loading process might take much longer than expected, you could sit
        and relax to wait or{" "}
        <button
          onClick={router.reload}
          className="underline cursor-pointer"
        >
          try reload.
        </button>
      </motion.small>
    </div>
  );
}

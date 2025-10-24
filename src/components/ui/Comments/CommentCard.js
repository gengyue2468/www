import { motion } from "motion/react";
import { HeartIcon } from "lucide-react";
import moment from "moment";

export default function CommentCard({
  inView,
  ref,
  user,
  email,
  content,
  like,
  date,
  index
}) {
  const initial = { opacity: 0, y: 20 };
  const animate = { opacity: 1, y: 0 };
  const transition = { type: "tween", ease: "easeOut", duration: 0.6 };
  return (
    <motion.div
      initial={initial}
      animate={inView ? animate : initial}
      transition={{ ...transition, delay: 0.1 * (index + 1) }}
      ref={ref}
      className="rounded-3xl px-6 py-6 bg-neutral-200/50 dark:bg-neutral-800/50"
    >
      <div className="flex flex-row gap-4 items-center justify-between w-full">
        <div className="flex flex-row gap-4 items-center">
          <img src="/static/author.webp" className="rounded-full size-12" />
          <div className="flex flex-col gap-0.5">
            <h1 className="font-extrabold text-xl">{user}</h1>
            <h2 className="opacity-50 font-semibold">{email}</h2>
          </div>
        </div>
        <button className="font-semibold bg-neutral-200 dark:bg-neutral-800 rounded-3xl px-4 py-4 focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black focus:opacity-100 opacity-50 flex gap-1 items-center">
          <HeartIcon className="size-6" /> <span>{like}</span>
        </button>
      </div>

      <div className="mt-4 text-lg">{content}</div>
      <div className="mt-4 opacity-50">
        <p>发表于 {moment(date).toNow()}</p>
      </div>
    </motion.div>
  );
}

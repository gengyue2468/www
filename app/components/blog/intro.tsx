import { Link } from "react-router";

export default function Intro({ wordCount }: { wordCount: number }) {
  return (
    <section className="">
      <div>
        <Link
          to="/"
          className="text-neutral-600 dark:text-neutral-400 no-underline!"
        >
          ↖ 返回
        </Link>
      </div>
      <div className="mt-8">
        <h1 className="">
          <span className="font-bold bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900">
            Geng Yue
          </span>
          在写博客.
        </h1>
        <h2 className="text-neutral-600 dark:text-neutral-400">
          {wordCount}{" "}
          字有关前端开发，神奇小故事，有趣小玩具，以及更多神奇的话题.
        </h2>
      </div>
      <div className="mt-8">
        <h1 className="">博客是无用之用，也可以是吴用之用！</h1>
        <h2 className="text-neutral-600 dark:text-neutral-400 italic">
         Although, I don't write something useful, at least I have written something.
        </h2>
      </div>
    </section>
  );
}

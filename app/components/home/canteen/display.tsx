import { Suspense, useState } from "react";
import { Link } from "react-router";
import { Await } from "react-router";
import type { Canteen } from "@/types/canteen";
import CanteenList from "./list";

interface CanteenDisplayProps {
  openedCanteen: Promise<Canteen[]>;
}

export default function CanteenDisplay({ openedCanteen }: CanteenDisplayProps) {
  const [showMoreCanteens, setShowMoreCanteens] = useState(false);
  return (
    <section className="mt-8 space-y-4">
      <h3 className="font-semibold">
        顺便问下，你想不想知道现在还有哪些食堂有吃的?
      </h3>
      <Suspense
        fallback={
          <div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-7.5 w-full flex items-center justify-between *:animate-pulse"
              >
                <div className="h-6 w-25 bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-6 w-30 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        }
      >
        <Await resolve={openedCanteen}>
          {(canteens) =>
            canteens.length > 0 ? (
              <CanteenList
                canteens={canteens}
                showMore={showMoreCanteens}
                onToggle={() => setShowMoreCanteens(!showMoreCanteens)}
              />
            ) : (
              <p className="font-medium text-neutral-600 dark:text-neutral-400">
                坏了，现在没有吃的了.
              </p>
            )
          }
        </Await>
      </Suspense>

      <p>
        这是一个名为“HUST吃饭”的小玩具，用 Node.js 根据 HUST
        的食堂营业时间判断目前还有哪些食堂有吃的，完整的代码可以在
        <Link to="https://github.com/gengyue2468/HUST-Chifan">GitHub</Link>
        上找到。
      </p>

      <p>
        你也可以阅读
        <Link to="/blog/hust-chifan" prefetch="intent">
          我写的这篇文章
        </Link>
        了解更多！
      </p>
    </section>
  );
}

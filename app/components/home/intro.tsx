import Link from "../public/link";
import { Await } from "react-router";
import type { Canteen } from "@/types/canteen";
import { Suspense } from "react";
import { MagneticText } from "@/components/public/cursor";

export default function Intro({
  openedCanteen,
}: {
  openedCanteen: Promise<Canteen[]>;
}) {
  return (
    <section className="">
      <div>
        <img
          src="/static/logo.webp"
          alt="Logo"
          className="w-16! rounded-full! mx-0!"
        />
      </div>
      <div className="mt-8">
        <h1 className="">
          <span className="font-bold bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900">
            Geng Yue
          </span>
          在写代码.
        </h1>
        <h2 className="text-neutral-600 dark:text-neutral-400">
          在<MagneticText text="华中大" />
          念计算机.
        </h2>

        <h1 className="mt-4">遗憾，这里并无什么有趣的服务.</h1>

        <h2 className="text-neutral-600 dark:text-neutral-400">
          <Suspense fallback={<>emm</>}>
            <Await resolve={openedCanteen}>
              {(canteens) => (canteens.length == 0 ? "坏耶" : "好耶")}
            </Await>
          </Suspense>
          ，现在还有
          <MagneticText
            className="italic! mx-px"
            text={
              <Suspense fallback={<> NaN </>}>
                <> </>
                <Await resolve={openedCanteen}>
                  {(canteens) => canteens.length}
                </Await>
                <> </>
              </Suspense>
            }
          />
          个食堂可以吃！
        </h2>
      </div>
      {/*}
      <div className="mt-16">
        <h2 className="text-neutral-600 dark:text-neutral-400">导航.</h2>
        <div className="flex flex-row items-center gap-4">
          <Link to="/blog" className="no-underline!">
            博客 ↗
          </Link>
          <Link to="https://chifan.huster.fun/" className="no-underline!">
            吃饭 ↗
          </Link>
        </div>
      </div>
      */}
      <div className="mt-8">
        <h2 className="text-neutral-600 dark:text-neutral-400">链接</h2>
        <div className="flex flex-row items-center gap-4">
          <Link to="mailto:gengyue2468@outlook.com" className="no-underline!">
            邮箱 ↗
          </Link>
          <Link to="https://github.com/gengyue2468" className="no-underline!">
            GitHub ↗
          </Link>
        </div>
      </div>
      <div className="mt-16">
        <h2 className="text-neutral-600 dark:text-neutral-400">
          <span className="font-bold">{`${new Date().getFullYear()}`}</span> 在
          中国<MagneticText text="武汉" />.
        </h2>
      </div>
    </section>
  );
}

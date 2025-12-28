import Link from "../public/link";
import { Await } from "react-router";
import type { Canteen } from "@/types/canteen";
import { Suspense } from "react";
import { MagneticText } from "@/components/public/cursor";
import {
  CodeIcon,
  EnvelopeIcon,
  ForkKnifeIcon,
  GithubLogoIcon,
  MapPinIcon,
  NotebookIcon,
  StudentIcon,
} from "@phosphor-icons/react";

export default function Intro({
  openedCanteen,
  wordCount,
}: {
  openedCanteen: Promise<Canteen[]>;
  wordCount: number;
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
          在写代码
          <CodeIcon
            className="size-6 md:size-7 lg:size-8 inline"
            weight="duotone"
          />
          .
        </h1>
        <h2 className="text-neutral-600 dark:text-neutral-400">
          在
          <MagneticText className="whitespace-nowrap">
            <span className="inline-block align-middle">
              <StudentIcon
                className="size-6 md:size-7 lg:size-8 inline-block align-text-top"
                weight="duotone"
              />
            </span>
            <span className="inline-block align-top">华中大</span>
          </MagneticText>
          念计算机.
        </h2>

        <h1 className="mt-4">
          神奇，我已经在
          <Link to="/blog" className="font-semibold whitespace-nowrap">
            <span className="inline-block align-middle">
              <NotebookIcon
                className="size-6 md:size-7 lg:size-8 inline-block align-text-top"
                weight="duotone"
              />
            </span>
            <span className="inline-block">博客↗</span>
          </Link>
          中写了高达
          <MagneticText className="italic mx-1">
            {wordCount.toLocaleString("en-US")}
          </MagneticText>
          个字的
          <MagneticText>废话</MagneticText>
          了！
        </h1>

        <h2 className="text-neutral-600 dark:text-neutral-400">
          <Suspense fallback={<>emm</>}>
            <Await resolve={openedCanteen}>
              {(canteens) => (canteens.length == 0 ? "坏耶" : "好耶")}
            </Await>
          </Suspense>
          ，现在还有
          <MagneticText className="italic! mx-1">
            <Suspense fallback={<> NaN </>}>
              <> </>
              <Await resolve={openedCanteen}>
                {(canteens) => canteens.length}
              </Await>
              <> </>
            </Suspense>
          </MagneticText>
          个食堂可以吃！
          <ForkKnifeIcon
            className="size-6 md:size-7 lg:size-8 inline"
            weight="duotone"
          />
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
            <span className="inline-block align-middle">
              <EnvelopeIcon
                className="size-6 md:size-7 lg:size-8 inline-block align-text-top mt-px"
                weight="duotone"
              />
            </span>
            <span className="inline-block">邮箱↗</span>
          </Link>
          <Link to="https://github.com/gengyue2468" className="no-underline!">
            <span className="inline-block align-middle">
              <GithubLogoIcon
                className="size-6 md:size-7 lg:size-8 inline-block align-text-top mt-px"
                weight="duotone"
              />
            </span>
            <span className="inline-block">GitHub↗</span>
          </Link>
        </div>
      </div>
      <div className="mt-16">
        <h2 className="text-neutral-600 dark:text-neutral-400">
          <span className="font-bold">{`${new Date().getFullYear()}`}</span>{" "}
          <MapPinIcon
            className="size-6 md:size-7 lg:size-8 inline -mt-1"
            weight="duotone"
          />
          在中国
          <MagneticText>武汉</MagneticText>.
        </h2>
      </div>
    </section>
  );
}

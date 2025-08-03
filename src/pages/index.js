import { site } from "@/lib/site.config";
import Layout from "@/components/Layout";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from "next/link";
import { NCMIcon } from "@/components/Icon";

export default function Home() {
  return (
    <Layout title="耿越">
      <div className="flex flex-row space-x-4 justify-between items-center text-balance">
        <div className="w-2/3">
          <h2 className="ml-0 mb-6">嗨！你好啊👋, 我想你想要：</h2>
          <div className="flex flex-col space-y-2">
            <Link
              href="/about"
              className="-translate-x-2 my-2 py-2 text-sm inline-flex flex-row space-x-1.5 items-center transition-all duration-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 px-2 rounded-lg w-auto"
            >
              <LazyLoadImage
                effect="blur"
                alt="Chris Griffin"
                src={`${site.cdn}/static/chris-griffin.webp`}
                className="rounded-full size-6 object-cover object-center"
              />
              <span>看看我的简介 ➡</span>
            </Link>
            <hr className="text-neutral-200 dark:text-neutral-800" />
            <Link
              href="/thoughts"
              className="-translate-x-2 my-2 py-2 text-sm inline-flex flex-row space-x-1.5 items-center transition-all duration-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 px-2 rounded-lg w-auto"
            >
              <LazyLoadImage
                effect="blur"
                alt="Peter Griffin"
                src={`${site.cdn}/static/peter-griffin.webp`}
                className="rounded-full size-6 object-cover object-center"
              />
              <span>
                见识一下<span className="line-through">抽象❌</span>
                出生✔的头脑风暴 ➡
              </span>
            </Link>
            <hr className="text-neutral-200 dark:text-neutral-800" />
            <Link
              href="/thoughts"
              className="-translate-x-2 my-2 py-2 text-sm inline-flex flex-row space-x-1.5 items-center transition-all duration-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 px-2 rounded-lg w-auto"
            >
              <LazyLoadImage
                effect="blur"
                alt="Stewie Griffin"
                src={`${site.cdn}/static/stewie-griffin.webp`}
                className="rounded-full size-6 object-cover object-center"
              />
              <span>领略一下出生的设计风格 ➡</span>
            </Link>
          </div>
          <h2 className="ml-0 mt-12 mb-6">
            或者，你可能想要了解一下我的近况：
          </h2>

          <div className="flex flex-col space-y-2">
            <div className="px-2 -translate-x-2 py-2 transition-all duration-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg">
              <h3>
                <small>省流版状态总结：状况不坏👌</small>
              </h3>
            </div>
            <hr className="text-neutral-200 dark:text-neutral-800" />
            <div className="flex flex-row items-center space-x-2 px-2 -translate-x-2 py-2 transition-all duration-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg">
              <LazyLoadImage
                effect="blur"
                alt="华中科技大学"
                src={`${site.cdn}/static/sign/hust.png`}
                className="rounded-full h-6 w-auto"
              />
              <small> 录取 😃</small>
            </div>
            <hr className="text-neutral-200 dark:text-neutral-800" />
            <div className="flex flex-row items-center space-x-2 px-2 -translate-x-2 py-2 transition-all duration-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg">
              <NCMIcon className="text-red-600 size-6" />
              <small>Rage Your Dream 🔥</small>
            </div>
            <hr className="text-neutral-200 dark:text-neutral-800" />
            <div className="px-2 -translate-x-2 py-2 transition-all duration-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg">
              <h3>
                <small>🐟 摸鱼快乐 哈哈哈哈哈哈哈</small>
              </h3>
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <LazyLoadImage
            effect="blur"
            alt="耿越 头像"
            src={`${site.cdn}/static/author.webp`}
            className="rounded-full size-24 sm:size-54 object-cover object-center"
          />
          <small>本人于诸多网站使用的头像，AI生成的</small>
        </div>
      </div>
    </Layout>
  );
}

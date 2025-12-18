import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import axios from "axios";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { allPosts, type Post } from "../blog/posts";
import { useState, useEffect } from "react";
import { OptimizedImage } from "~/components/OptimizedImage";

dayjs.extend(duration);

type Canteen = {
  name: string;
  remaining: string;
};

export async function loader({}: Route.LoaderArgs) {
  try {
    const canteenResponse = await axios.get(
      "https://chifan.huster.fun/api/open-now"
    );
    const openedCanteen: Canteen[] = Array.isArray(canteenResponse.data)
      ? canteenResponse.data
      : [];
    return { openedCanteen };
  } catch (error) {
    console.error("Error fetching canteen status:", error);
    return { openedCanteen: [] as Canteen[] };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Geng Yue" },
    {
      name: "description",
      content:
        "你好，我是 Geng Yue，一名来自华中科技大学的计算机科学与技术专业学生。关注前端开发和互联网技术。",
    },
    {
      name: "keywords",
      content:
        "Geng Yue, 耿越, 华中科技大学, 计算机科学与技术, 前端开发, 互联网技术, 冰岩作坊, BuddyUp",
    },
    {
      name: "author",
      content: "Geng Yue",
    },
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "og:title",
      content: "Geng Yue",
    },
    {
      name: "og:description",
      content:
        "你好，我是 Geng Yue，一名来自华中科技大学的计算机科学与技术专业学生。关注前端开发和互联网技术。",
    },
    {
      name: "og:image",
      content: "https://gengyue.site/og-image.png",
    },
    {
      name: "og:url",
      content: "https://gengyue.site",
    },
    {
      name: "og:type",
      content: "website",
    },
    {
      name: "og:locale",
      content: "zh-CN",
    },
    {
      name: "og:site_name",
      content: "Geng Yue",
    },
    {
      name: "og:locale:alternate",
      content: "en-US",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: "Geng Yue",
    },
    {
      name: "twitter:description",
      content:
        "你好，我是 Geng Yue，一名来自华中科技大学的计算机科学与技术专业学生。关注前端开发和互联网技术。",
    },
    {
      name: "twitter:image",
      content: "https://gengyue.site/og-image.png",
    },
    {
      name: "twitter:url",
      content: "https://gengyue.site",
    },
    {
      name: "twitter:site",
      content: "@gengyue2468",
    },
    {
      name: "twitter:creator",
      content: "@gengyue2468",
    },
  ];
}

export default function Home() {
  const { openedCanteen } = useLoaderData<typeof loader>();
  const latestPosts: Post[] = allPosts.slice(0, 3);
  const [showMoreCanteens, setShowMoreCanteens] = useState(false);
  const displayedCanteens = showMoreCanteens
    ? openedCanteen
    : openedCanteen.slice(0, 3);
  return (
    <>
      <header className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <h1 className="font-semibold">Geng Yue</h1>
          <p className="font-medium text-neutral-600 dark:text-neutral-400">
            CS Student, HUST
          </p>
        </div>
        <h2 className="font-medium ">中国 · 武汉</h2>
      </header>

      <section className="mt-4 relative">
        <Link
          className="my-0 no-underline! hover:opacity-100!"
          to="https://www.google.com/maps/place/%E5%8D%8E%E4%B8%AD%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%A6/@30.6260532,114.214542,11.25z/data=!4m6!3m5!1s0x342ea4a4f8a230e9:0xf42f097ec953d0b1!8m2!3d30.5130043!4d114.4202756!16zL20vMDQ4bjRt?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
        >
          <OptimizedImage
            src="/static/cover/map.png"
            alt="我的位置"
            loading="lazy"
          />
        </Link>
      </section>

      <section className="mt-4 space-y-4">
        <p>
          你好啊! 再次感谢您访问我的网站，如你所见，我现在在
          <Link to="https://hust.edu.cn">华中科技大学 (HUST)</Link>
          念计算机科学与技术专业，目前是大一的xdx.
        </p>
        <p>
          我主要进行前端开发，并且对互联网技术感兴趣。一般来说，我的技术栈包括
          React、TypeScript、 Next.js 和 Tailwind CSS。现在我是
          <Link to="https://bingyan.net">冰岩作坊</Link>前端组的一员。
        </p>
        <p>
          你可以随意向<Link to="mailto:ciallo@gengyue.site">我的邮箱</Link>
          投递垃圾。
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h3 className="font-semibold">
          顺便问下，你想不想知道现在还有哪些食堂有吃的?
        </h3>
        {openedCanteen.length > 0 ? (
          <ul className="">
            {displayedCanteens.map((canteen: Canteen) => {
              const d = dayjs.duration(canteen.remaining);

              const hours = Math.floor(d.asHours());
              const minutes = d.minutes();
              return (
                <div
                  key={canteen.name}
                  className="flex flex-row items-center justify-between py-0.5"
                >
                  <span className="font-medium">{canteen.name}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    还能吃{" "}
                    {hours > 0
                      ? `${hours} 小时 ${minutes} 分`
                      : `${minutes} 分`}
                  </span>
                </div>
              );
            })}
            {openedCanteen.length > 3 && (
              <button
                className="mt-2 font-medium underline cursor-pointer"
                onClick={() => setShowMoreCanteens(!showMoreCanteens)}
              >
                {showMoreCanteens
                  ? "收起"
                  : `+ ${openedCanteen.length - 3} 个食堂`}
              </button>
            )}
          </ul>
        ) : (
          <p className="font-medium text-neutral-600 dark:text-neutral-400">
            坏了，现在没有吃的了.
          </p>
        )}

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
      <section className="mt-8 space-y-4">
        <h3 className="font-semibold">
          对了，我还经常写一些很史的文章，由于没有良好的文笔，所以写出来的东西也就那样……看看得了
        </h3>

        {latestPosts.length > 0 ? (
          <ul className="space-y-0">
            {latestPosts.map((post: Post) => (
              <Link
                to={`/blog/${post.slug}`}
                prefetch="intent"
                className="py-1 no-underline! flex flex-row items-center gap-4 justify-between group-hover:opacity-30 hover:opacity-100 transition-opacity"
                key={post.slug}
              >
                <h2 className="font-medium">{post.title}</h2>
                {post.date && (
                  <p className="font-normal text-neutral-600 dark:text-neutral-400">
                    {dayjs(post.date).format("YYYY/MM/DD")}
                  </p>
                )}
              </Link>
            ))}
          </ul>
        ) : null}

        <p>
          这些文章大多是一些奇怪的/有用的/没用的想法。如果你有兴趣，可以访问我的{" "}
          <Link to="/blog" prefetch="intent">
            博客页面
          </Link>
          查看更多内容。
        </p>

        <Link to="/blog" prefetch="intent" className="font-medium">
          查看所有文章 →
        </Link>
      </section>
      <section className="mt-8 space-y-4">
        <h3 className="font-semibold">那么，我最近有在忙什么吗？</h3>
        <p>
          现代人容易陷入无意义的忙碌中，我就不一样了，我不是吃就是睡，偶尔敲几下代码。剩下的...Cursor
          宝宝，来帮我完成！"什么？！不要乱动我的代码！都说了用中文回答我！"
        </p>
        <p>
          当然，如果你需要留学申请文书写作辅助工具的话，我们正在开发一款小工具——{" "}
          <Link to="https://buddyup.top">BuddyUp</Link>. 使用 AI
          驱动，帮你轻松写出独属于你的最佳个人陈述！
        </p>
        <p>
          自从冲动开了个网易云音乐学生 VIP 会员后，整天都在听歌，听的主要是 90 -
          10 年代的歌，不能说我审美的倒退吧，我怎么感觉是进步呢...
        </p>
      </section>
    </>
  );
}

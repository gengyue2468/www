import classNames from "classnames";
import { ChevronRightIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Footer({ allPosts, allContents }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [breadcrumb, setBreadcrumb] = useState([]);

  useEffect(() => {
    const getBreadcrumbNav = () => {
      setBreadcrumb(router.asPath.split("/"));
    };

    getBreadcrumbNav();
  }, [router.asPath]);

  return (
    <div className="bg-neutral-200/50 dark:bg-neutral-800/50 py-8">
      <div className="max-w-3xl mx-auto px-8">
        <div className="flex flex-row gap-2">
          <img src="/static/author.webp" className="size-6 rounded-full" />
          {breadcrumb.map((nav, index) => (
            <span
              key={index}
              className="flex flex-row gap-1 items-center text-neutral-600 dark:text-neutral-400"
            >
              {nav}
              {index !== breadcrumb.length - 1 && (
                <ChevronRightIcon className="size-5" />
              )}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-row justify-between w-full text-sm">
          <div className="flex flex-col gap-2 w-1/3">
            <h1 className="font-medium">内容和信息</h1>
            <div className="mt-2 flex flex-col gap-2">
              {allContents.map((content, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/${content.slug}`)}
                  className="text-neutral-700 dark:text-neutral-300 text-left cursor-pointer hover:underline"
                >
                  {content.frontmatter.title}
                </button>
              ))}
            </div>
          </div>

          <div className="gap-8 columns-2 w-2/3">
            <h1 className="font-medium">博客归档</h1>
            <div className="mt-2 flex flex-col gap-2">
              {allPosts.map((content, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/blog/${content.slug}`)}
                  className="text-neutral-700 dark:text-neutral-300 text-left cursor-pointer hover:underline"
                >
                  {content.frontmatter.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-between items-center">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            对文章内容有疑问？那就
            <a
              href="mailto:hi@huster.fun"
              className="text-blue-500 hover:underline"
            >
              发邮件
            </a>
            给我吧.
          </p>

          <div className="text-xs border border-blue-500 rounded-3xl p-0.5">
            <button
              onClick={() => setTheme("light")}
              className={classNames(
                "rounded-xl px-2 py-1",
                theme == "light" ? "bg-blue-500 text-white" : "text-blue-500"
              )}
            >
              明亮
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={classNames(
                "rounded-xl px-2 py-1",
                theme == "dark" ? "bg-blue-500 text-white" : "text-blue-500"
              )}
            >
              黑暗
            </button>
            <button
              onClick={() => setTheme("system")}
              className={classNames(
                "rounded-xl px-2 py-1",
                theme == "system" ? "bg-blue-500 text-white" : "text-blue-500"
              )}
            >
              系统
            </button>
          </div>
        </div>

        <hr className="text-neutral-300 dark:text-neutral-700 my-2" />

        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          Copyright © 2025 All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

import Head from "next/head";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import moment from "moment";
import {
  EarthIcon,
  LaptopIcon,
  LightningIcon,
  WrenchIcon,
  SunIcon,
  MoonIcon,
} from "./Icon";
import { site } from "@/lib/site.config";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Layout({ title, children }) {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const Nav = [
    {
      name: "主页",
      href: "/",
    },
    {
      name: "简介",
      href: "/about",
    },
    {
      name: "脑洞",
      href: "/thoughts",
    },
    {
      name: "设计",
      href: "/design",
    },
  ];
  const [deployTime, setDeployTime] = useState("");
  useEffect(() => {
    fetch("/deploy-time.json")
      .then((res) => res.json())
      .then((data) => setDeployTime(data.deployTime));
  }, []);
  return (
    <div className="">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-2xl mx-auto py-32 px-6 z-0">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row space-x-2.5">
            <LazyLoadImage
              effect="blur"
              alt="耿越 头像"
              src={`${site.cdn}/static/author.webp`}
              className="rounded-full size-10 object-cover object-center"
            />
            <div className="flex flex-col -space-y-0">
              <h1 className="tracking-wider">耿越</h1>
              <small className="tracking-wide">华中科技大学 · 大一</small>
            </div>
          </div>
          <div className="flex flex-row space-x-2.5">
            <button
              className="cursor-pointer rounded-full size-10 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 flex items-center justify-center"
              onClick={() =>
                setTheme(resolvedTheme === "light" ? "dark" : "light")
              }
            >
              {resolvedTheme === "system" && <LaptopIcon className="size-4" />}
              {resolvedTheme === "light" && <SunIcon className="size-4" />}
              {resolvedTheme === "dark" && <MoonIcon className="size-4" />}
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-row space-x-2">
          {Nav.map((item) => {
            return (
              <button
                onClick={() => router.push(item.href)}
                className={cn(
                  "text-xs font-medium rounded-none px-1 py-1 transition-all duration-500",
                  (
                    item.href === "/"
                      ? router.asPath === item.href
                      : router.asPath.includes(item.href)
                  )
                    ? "opacity-100 border-b-2"
                    : "opacity-50 border-b-2 border-b-transparent"
                )}
              >
                {item.name}
              </button>
            );
          })}
        </div>
        <main className="mt-16">{children}</main>
        <footer className="mt-32 font-medium">
          <small className="flex flex-row items-center">
            <LightningIcon className="size-3 mr-1" /> 网站上次部署于
            {moment(deployTime).format("YYYY年MM月DD日HH:mm:ss")}.
          </small>
          <small className="flex flex-row items-center">
            <WrenchIcon className="size-3 mr-1" /> 使用Next.js 和
            TailwindCSS构建.
          </small>
          <small className="flex flex-row items-center">
            <EarthIcon className="size-3 mr-1" /> 内容托管于Vercel, Netlify 和
            Notion.
          </small>
          <small className="mt-0.5">
            Copyright © <span className="">{new Date().getFullYear()}</span>{" "}
            保留所有权利.
          </small>
        </footer>
      </div>
    </div>
  );
}

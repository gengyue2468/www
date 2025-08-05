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
  UserIcon,
  HomeIcon,
  BrainIcon,
  PaintIcon,
} from "./Icon";
import { site } from "@/lib/site.config";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { motion } from "motion/react";

export default function Layout({ title, children }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const Nav = [
    {
      name: "主页",
      href: "/",
      icon: <HomeIcon className="size-4" />,
    },
    {
      name: "简介",
      href: "/about",
      icon: <UserIcon className="size-4" />,
    },
    {
      name: "脑洞",
      href: "/thoughts",
      icon: <BrainIcon className="size-4" />,
    },
    {
      name: "设计",
      href: "/design",
      icon: <PaintIcon className="size-4" />,
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
      <div className="max-w-2xl mx-auto py-32 px-6 z-0 overflow-visible">
        <button
          className="rounded-full p-2 size-12 mb-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900  cursor-pointer flex  justify-center items-center"
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        >
          {theme === "system" && <LaptopIcon className="size-5" />}
          {theme === "light" && <SunIcon className="size-5" />}
          {theme === "dark" && <MoonIcon className="size-5" />}
        </button>
        <motion.main
          initial={{ opacity: 0, y: -20, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="mt-16"
        >
          {children}
        </motion.main>
        <footer className="mt-64 font-medium opacity-50">
          <p className="flex flex-row items-center">
            上次构建时间：
            {moment(deployTime).format("YYYY年MM月DD日HH:mm:ss")}.
          </p>
          <p className="flex flex-row items-center">
            自豪地由 Next.js 和 TailwindCSS 驱动
          </p>
          <p className="flex flex-row items-center">
            云服务由 Vercel，Netlify 和 Notion 提供支持
          </p>
          <p className="mt-0.5">
            Copyright © <span className="">{new Date().getFullYear()}</span>{" "}
            保留所有权利.
          </p>
        </footer>
      </div>
    </div>
  );
}

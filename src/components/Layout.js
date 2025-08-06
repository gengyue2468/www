import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";

export default function Layout({ title, children }) {
  const [deployTime, setDeployTime] = useState("");
  const LinkStyle =
    "group-hover:opacity-50 hover:opacity-100 transition-all duration-300 py-1.5 px-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl -translate-x-3";
  useEffect(() => {
    fetch("/deploy-time.json")
      .then((res) => res.json())
      .then((data) => setDeployTime(data.deployTime));
  }, []);
  return (
    <div className="scroll-smooth">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-2xl mx-auto py-32 px-8 z-0 overflow-visible">
        <main className="mt-16 scroll-smooth">{children}</main>

        <div className="mt-32 font-medium text-base sm:text-lg inline-flex flex-col group">
          <Link href="/" className={LinkStyle}>
            主页
          </Link>
          <Link href="/about" className={LinkStyle}>
            关于
          </Link>
          <Link href="/now" className={LinkStyle}>
            现状
          </Link>
          <Link href="/design" className={LinkStyle}>
            设计
          </Link>
        </div>
        <footer className="mt-32 font-medium text-sm sm:text-base flex flex-col space-y-1.5">
          <p className="flex flex-row items-center">
            上次构建{" "}
            {moment(deployTime).format("YYYY 年 MM 月 DD 日 HH:mm:ss")}.
          </p>
          <p className="flex flex-row items-center">
            自豪地由 Next.js 和 TailwindCSS 驱动
          </p>
          <p className="flex flex-row items-center">
            云服务由 Vercel，Netlify 和 Notion 支持
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

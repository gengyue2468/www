import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";

export default function Layout({ title, children }) {
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
        <main className="mt-16">{children}</main>

        <div className="mt-32 font-medium text-base sm:text-lg flex flex-col space-y-3">
           <Link
            href="/"
            className="opacity-100 hover:opacity-75 transition-all duration-300"
          >
            主页
          </Link>
          <Link
            href="/about"
            className="opacity-100 hover:opacity-75 transition-all duration-300"
          >
            关于
          </Link>
          <Link
            href="/now"
            className="opacity-100 hover:opacity-75 transition-all duration-300"
          >
            现状
          </Link>
          <Link
            href="/design"
            className="opacity-100 hover:opacity-75 transition-all duration-300"
          >
            设计
          </Link>
        </div>
        <footer className="mt-32 font-medium text-base flex flex-col space-y-1.5">
          <p className="flex flex-row items-center">
            上次构建{" "}
            {moment(deployTime).format("YYYY 年 MM 月 DD 日 HH : mm : ss")}.
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

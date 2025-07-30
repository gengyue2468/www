import Head from "next/head";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import moment from "moment";

export default function Layout({ title, children }) {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const Nav = [
    {
      name: "他的主页",
      href: "/",
    },
    {
      name: "他的简介",
      href: "/about",
    },
    {
      name: "他的脑洞",
      href: "/thoughts",
    },
    {
      name: "他的设计",
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
      <div className="max-w-4xl mx-auto py-32 px-6 z-0">
        <main>{children}</main>
        <div className="mt-16 flex flex-col space-y-0 sm:space-y-4">
          <h1 className="text-lg sm:text-3xl opacity-50 my-4">
            <span className="invisible">-</span> 网站导航
          </h1>
          {Nav.map((item, index) => {
            const active =
              item.href === "/"
                ? router.asPath === "/"
                : router.asPath.includes(item.href);
            return (
              <a
                onClick={() => router.push(item.href)}
                key={index}
                className={cn(
                  "text-lg sm:text-3xl mt-4 font-medium cursor-pointer hover:opacity-75 transition-all duration-300",
                  active ? "opacity-50" : ""
                )}
              >
                - {item.name}
              </a>
            );
          })}
          <a
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="text-lg sm:text-3xl mt-4 font-medium cursor-pointer hover:opacity-75 transition-all duration-300"
          >
            - 切换主题
          </a>
        </div>
        <footer className="mt-32 opacity-50">
          <p className="flex flex-row">
            网站上次部署于
            {moment(deployTime).format("YYYY年MM月DD日HH:mm:ss")}
          </p>
          <p>
            Copyright © <span className="">{new Date().getFullYear()}</span>{" "}
            保留所有权利.
          </p>
        </footer>
      </div>
    </div>
  );
}

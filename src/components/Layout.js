import Head from "next/head";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import LastDeploymentTime from "./last-deploy-time";

export default function Layout({ title, note, sticky, children }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
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
  return (
    <div className="">
      <Head>
        <title>{title}</title>
      </Head>

      <div className="max-w-4xl mx-auto py-32 px-6">
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
            {new Date(
              process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_CREATED_AT
            ).toLocaleString()}
          </p>
          <p>© {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

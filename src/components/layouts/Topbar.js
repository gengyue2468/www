import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import Link from "next/link";
import Tooltip from "../ui/Tooltip";

const NavItems = [
  {
    name: "关于",
    href: "/",
  },
  {
    name: "随想",
    href: "/whims",
  },
  {
    name: "设计",
    href: "/design",
  },
];

export default function Topbar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div className="z-10 sticky top-0 bg-transparent">
      <div className="max-w-7xl mx-auto py-2 px-8">
        <div className="flex flex-row justify-between items-center">
          <Tooltip content="主页">
            <div className="-translate-x-4 flex flex-row space-x-2 transition-all duration-500 px-3 py-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-full cursor-pointer">
              <img
                src="/static/author.webp"
                className="size-6 rounded-full"
                alt="头像"
              />
              <h1
                className="font-extrabold"
                onClick={() => {
                  router.push("/", undefined, { scroll: false });
                }}
              >
                BriGriff
              </h1>
            </div>
          </Tooltip>

          <div className="flex flex-row items-center space-x-0.5 sm:space-x-1.5">
            {NavItems.map((item, index) => {
              const active =
                item.href == "/"
                  ? router.asPath == "/"
                  : router.asPath.includes(item.href);
              return (
                <Tooltip key={index} content={item.href}>
                  <button
                    onClick={() => {
                      router.push(item.href, undefined, { scroll: false });
                    }}
                    className={`no-underline! cursor-pointer transition-all duration-500 px-3 py-2 rounded-full  focus:ring-2 focus:ring-neutral-500 focus:outline-none ${
                      active
                        ? "font-extrabold opacity-100 bg-black text-white dark:bg-white dark:text-black"
                        : "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 font-semibold opacity-50"
                    } hover:opacity-100`}
                  >
                    {item.name}
                  </button>
                </Tooltip>
              );
            })}
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="size-9 flex items-center justify-center cursor-pointer transition-all duration-500 p-2 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 focus:ring-2 focus:ring-neutral-500 focus:outline-none ${
              opacity-50
                 hover:opacity-100"
            >
              {resolvedTheme === "light" ? (
                <SunIcon className="fill-black" />
              ) : (
                <MoonIcon className="fill-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

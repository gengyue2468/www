import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import { useState } from "react";

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
    <div className="z-10 sticky top-0 border-b border-neutral-300/25 dark:border-neutral-700/25 bg-white/75 dark:bg-black/75 backdrop-blur-sm w-full">
      <div className="max-w-3xl mx-auto py-1.5 px-8">
        <div className="flex flex-row justify-between items-center">
          <h1
            className="-translate-x-1 font-semibold text-sm transition-all duration-500 px-1.5 py-1 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 rounded-sm cursor-pointer"
            onClick={() => router.push("/")}
          >
            BriGriff
          </h1>
          <div className="flex flex-row items-center space-x-1.5">
            {NavItems.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.href)}
                className={`cursor-pointer transition-all duration-500 text-xs px-1.5 py-1 rounded-sm hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 focus:ring-2 focus:ring-neutral-500 focus:outline-none ${
                  item.href === router.asPath ? "opacity-100" : "opacity-50"
                } hover:opacity-100`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="cursor-pointer transition-all duration-500 text-xs px-1 py-1 rounded-sm hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 focus:ring-2 focus:ring-neutral-500 focus:outline-none ${
              opacity-50
                 hover:opacity-100"
            >
              {resolvedTheme === "dark" ? (
                <SunIcon size={16} className="fill-black" />
              ) : (
                <MoonIcon size={16} className="fill-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

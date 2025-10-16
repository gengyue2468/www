import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import Link from "next/link";

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
    <div className="z-10 sticky top-0 bg-white/75 dark:bg-black/75 backdrop-blur-sm w-full">
      <div className="max-w-3xl mx-auto py-2 px-8">
        <div className="flex flex-row justify-between items-center">
          <h1
            className="-translate-x-1 font-semibold text-sm transition-all duration-500 px-1.5 py-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-sm cursor-pointer"
            onClick={() => {
              router.push("/", undefined, { scroll: false });
            }}
          >
            BriGriff
          </h1>
          <div className="flex flex-row items-center space-x-1.5">
            {NavItems.map((item, index) => {
              const active =
                item.href == "/"
                  ? router.asPath == "/"
                  : router.asPath.includes(item.href);
              return (
                <Link
                  href={item.href}
                  key={index}
                  scroll={false}
                  className={`no-underline! cursor-pointer transition-all duration-500 text-xs px-1.5 py-1 rounded-sm hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 focus:ring-2 focus:ring-neutral-500 focus:outline-none ${
                    active ? "font-semibold opacity-100" : "opacity-50"
                  } hover:opacity-100`}
                >
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="flex items-center space-x-1 cursor-pointer transition-all duration-500 text-xs px-1 py-1 rounded-sm hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 focus:ring-2 focus:ring-neutral-500 focus:outline-none ${
              opacity-50
                 hover:opacity-100"
            >
              {resolvedTheme === "light" ? (
                <SunIcon size={16} className="fill-black" />
              ) : (
                <MoonIcon size={16} className="fill-white" />
              )}
              <span>{resolvedTheme == "light" ? "明亮" : "黑暗"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

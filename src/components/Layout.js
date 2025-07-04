import Head from "next/head";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Laptop2Icon, MoonIcon, SunIcon } from "lucide-react";
import { useRouter } from "next/router";
import { motion } from "motion/react";

const Nav = [
  {
    name: "About",
    href: "/",
  },
  {
    name: "Thoughts",
    href: "/thoughts",
  },
  {
    name: "Lab",
    href: "/lab",
  },
];

export default function Layout({ title, note, sticky, children }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-grow flex-col sm:flex-row justify-between">
        <div className="max-w-4xl w-full flex flex-col sm:flex-row justify-between text-balance">
          <div className="z-50 sticky top-0 sm:left-0 bg-background/75 backdrop-blur-lg h-auto sm:h-screen w-full sm:w-48 sm:mt-0 px-2 py-1 sm:py-16 flex flex-row sm:flex-col justify-between sm:justify-start items-center">
            <div className="flex flex-row sm:flex-col italic">
              {Nav.map((item) => (
                <Button
                  key={item.name}
                  variant="link"
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "transition-all duration-500 cursor-pointer serif text-sm sm:text-base",
                    router.asPath === item.href
                      ? "opacity-100 font-semibold"
                      : "opacity-75"
                  )}
                >
                  {item.name}
                </Button>
              ))}
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                variant="ghost"
                className="rounded-full size-10 text-foreground"
              >
                {theme === "system" && <Laptop2Icon size="6" />}
                {theme === "light" && <SunIcon size="6" />}
                {theme === "dark" && <MoonIcon size="6" />}
              </Button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
            className="w-full px-6 sm:px-16 py-6 sm:py-16"
          >
            <main>{children}</main>
          </motion.div>
        </div>
        <div className="sticky right-0 w-full sm:w-64 sm:mt-0 py-2 sm:py-16">
          {note}
        </div>
      </div>
    </div>
  );
}

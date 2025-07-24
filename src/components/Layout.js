import Head from "next/head";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Laptop2Icon, MoonIcon, SunIcon } from "lucide-react";
import { useRouter } from "next/router";
import { motion } from "motion/react";

export default function Layout({ title, note, sticky, children }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const variants = {
    initial: {
      opacity: 0,
      y: 20,
      filter: "blur(20px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut", 
      },
    },
  };

  return (
    <div className="">
      <Head>
        <title>{title}</title>
      </Head>

      <motion.main
        variants={variants}
        className="max-w-2xl mx-auto px-6 py-32"
      >
        {children}
      </motion.main>
    </div>
  );
}

import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

import "@/styles/globals.css";
import "@/styles/highlight.css";
import "katex/dist/katex.min.css";

import Topbar from "@/components/layouts/Topbar";

export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  const pageVariants = {
    initial: {
      opacity: 0,
      filter: "blur(16px)",
      y: 20,
    },
    in: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
    },
    out: {
      opacity: 0,
      filter: "blur(16px)",
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {ready && (
        <div className="min-h-0">
          <div className="bg-neutral-100 dark:bg-neutral-900 px-2 py-2 z-10 sticky">
            <h1 className="font-bold text-xs max-w-7xl mx-auto text-neutral-500 px-8">
              你能做的，岂止如此
            </h1>
          </div>
          <div className="bg-gradient-to-b from-white dark:from-black to-transparent w-full fixed top-0 h-30 z-[5] pointer-events-none" />
          <Topbar />
          {/*
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={router.asPath}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className=""
              onAnimationComplete={() => {
                setTimeout(() => {
                  document.documentElement.style.height = "auto";
                  document.body.style.height = "auto";
                }, 100);
              }}
            >
             
            </motion.div>
          </AnimatePresence> */}
          <Component {...pageProps} />
        </div>
      )}
    </ThemeProvider>
  );
}

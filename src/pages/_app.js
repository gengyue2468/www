import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import Topbar from "@/components/layouts/Topbar";

export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setReady(true);
  }, []);

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
        <div>
          <div className="bg-neutral-100 dark:bg-neutral-900 text-center px-2 py-2 mb-4">
            <p className="text-xs opacity-50">新的设计正处于测试中 🔥🔥🔥</p>
          </div>
          <Topbar />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={router.route}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </ThemeProvider>
  );
}

import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import "@fontsource-variable/jetbrains-mono";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useState, useEffect } from "react";
import "moment/locale/zh-cn";
import moment from "moment";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "motion/react";

export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);
  moment.locale("zh-cn");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const router = useRouter();
  const pageVariants = {
    initial: {
      opacity: 0,
      filter: "blur(10px)",
    },
    in: {
      opacity: 1,
      filter: "blur(0px)",
    },
    out: {
      opacity: 0,
      filter: "blur(10px)",
    },
  };
  const pageTransitions = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };
  return (
    <>
      {isClient && (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={router.asPath}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransitions}
              style={{ minHeight: "100vh" }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </ThemeProvider>
      )}
    </>
  );
}

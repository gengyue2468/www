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
  const [direction, setDirection] = useState("down"); // 记录滚动方向：down(向下)/up(向上)
  const router = useRouter();

  moment.locale("zh-cn");

  useEffect(() => {
    setIsClient(true);

    const handleRouteChange = (url) => {
      const currentDepth = router.asPath.split("/").filter(Boolean).length;
      const newDepth = url.split("/").filter(Boolean).length;

      setDirection(newDepth > currentDepth ? "down" : "up");
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  const pageVariants = {
    initial: {
      opacity: 0,
      y: direction === "down" ? "100%" : "-100%",
      filter: "blur(8px)",
    },
    in: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
    out: {
      opacity: 0,
      y: direction === "down" ? "-30%" : "30%",
      filter: "blur(8px)",
    },
  };

  const pageTransitions = {
    type: "spring",
    stiffness: 220,
    damping: 30,
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={router.asPath}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransitions}
              onAnimationComplete={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{
                minHeight: "100vh",
                position: "absolute",
                width: "100%",
                top: 0,
                left: 0,
                willChange: "transform, opacity",
              }}
            >
              <Component {...pageProps} />
            </motion.div>
          </AnimatePresence>
        </ThemeProvider>
      )}
    </>
  );
}

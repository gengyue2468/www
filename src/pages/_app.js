import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import "@fontsource-variable/jetbrains-mono";
import "react-lazy-load-image-component/src/effects/blur.css";
import 'katex/dist/katex.min.css';
import { useState, useEffect, useRef } from "react";
import "moment/locale/zh-cn";
import moment from "moment";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "motion/react";
import { SessionProvider } from 'next-auth/react';
import '@fontsource-variable/inter';
import '@fontsource-variable/inter/wght-italic.css';

const isHashChange = (currentUrl, newUrl) => {
  try {
    const current = new URL(currentUrl, 'http://localhost');
    const next = new URL(newUrl, 'http://localhost');
    return current.pathname === next.pathname && current.search === next.search;
  } catch {
    return false;
  }
};

const generateAnimationKey = (router) => {
  const pathname = router.pathname;
  
  const slug = router.query.slug || '';
  const id = router.query.id || '';
  
  if (slug) {
    return `${pathname}-${slug}`;
  }
  
  if (id) {
    return `${pathname}-${id}`;
  }
  
  return pathname;
};

export default function App({ Component, pageProps: { session, ...pageProps }  }) {
  const [isClient, setIsClient] = useState(false);
  const [direction, setDirection] = useState("down");
  const router = useRouter();
  const lastPathname = useRef(router.pathname);
  const animationKey = generateAnimationKey(router);

  moment.locale("zh-cn");

  useEffect(() => {
    setIsClient(true);

    const handleAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href === '#') return;
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState(null, null, href);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    const handleRouteChange = (url) => {
      if (isHashChange(router.asPath, url)) {
        return;
      }

      const currentDepth = router.pathname.split("/").filter(Boolean).length;
      const newPathname = url.split('?')[0];
      const newDepth = newPathname.split("/").filter(Boolean).length;
      
      setDirection(newDepth > currentDepth ? "down" : "up");
      lastPathname.current = router.pathname;
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      document.removeEventListener('click', handleAnchorClick);
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
    <SessionProvider session={session}>
      {isClient && (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={animationKey} // 使用自定义键值
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransitions}
              onAnimationComplete={() => {
                // 只有当路径名发生变化时才滚动到顶部
                if (lastPathname.current !== router.pathname) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  lastPathname.current = router.pathname;
                }
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
    </SessionProvider>
  );
}
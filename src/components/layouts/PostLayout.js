import Head from "next/head";
import Navbar from "../ui/Navbar";
import Sidebar from "../ui/Sidebar";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import classNames from "classnames";
import Toc from "../ui/Toc";
import { useDeviceType } from "@/hooks/useDeviceType";
import Footer from "./Footer";
import { useRouter } from "next/router";

export default function PostLayout({ children, title, allPosts, allContents }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [rendered, setRendered] = useState(false);

  const isMobile = useDeviceType();
  const router = useRouter();

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
    setIsTocOpen(!isMobile);

    const timer = setTimeout(() => {
      setRendered(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [isMobile, router.asPath]);

  const handleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isTocOpen) {
      setIsTocOpen(false);
    }
  };

  const handleToc = () => {
    setIsTocOpen(!isTocOpen);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="overflow-x-clip">
      <Head>
        <title>{title}</title>
      </Head>
      <Navbar
        title={title}
        sidebarOpen={isSidebarOpen}
        openSidebar={
          isMobile ? handleSidebar : () => setIsSidebarOpen(!isSidebarOpen)
        }
        forceSidebarOpen={() => setIsSidebarOpen(true)}
        tocOpen={isTocOpen}
        openToc={isMobile ? handleToc : () => setIsTocOpen(!isTocOpen)}
      />
      <div className="flex flex-row gap-0 md:gap-2 xl:gap-16 relative">
        <motion.div
          initial={{
            x: isSidebarOpen ? 0 : -514,
            opacity: isSidebarOpen ? 1 : 0,
          }}
          animate={
            rendered
              ? {
                  x: isSidebarOpen ? 0 : -514,
                  opacity: isSidebarOpen ? 1 : 0,
                }
              : false
          }
          transition={{ duration: rendered ? 0.3 : 0, ease: "easeInOut" }}
          className={classNames(
            "fixed md:sticky top-0 h-screen px-8 md:px-2 xl:px-8 pb-2 pt-16 overflow-y-auto bg-neutral-100 dark:bg-neutral-900 border-0 z-20 w-full md:w-1/4 xl:w-1/4"
          )}
          style={{ left: 0, transform: "none" }}
          layout
        >
          <Sidebar allContents={allContents} allPosts={allPosts} />
        </motion.div>

        <motion.main className="flex-1 px-8 py-16 mx-auto w-[calc(100%-4rem)]" layout>
          {children}
        </motion.main>

        <motion.div
          initial={{ x: isTocOpen ? 0 : 514, opacity: isTocOpen ? 1 : 0 }}
          animate={
            rendered
              ? {
                  x: isTocOpen ? 0 : 514,
                  opacity: isTocOpen ? 1 : 0,
                }
              : false
          }
          transition={{ duration: rendered ? 0.3 : 0, ease: "easeInOut" }}
          className={classNames(
            "w-full md:w-1/5 xl:w-1/5 fixed md:sticky top-0 h-screen px-8 md:px-2 xl:px-8 pb-2 pt-16 overflow-y-auto bg-neutral-100 dark:bg-neutral-900 border-0 z-20"
          )}
          style={{ right: 0, transform: "none" }}
          layout
        >
          <Toc />
        </motion.div>
      </div>
      <Footer allPosts={allPosts} allContents={allContents} />
    </div>
  );
}

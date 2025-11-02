import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "../styles/highlight.css";
import { ThemeProvider } from "next-themes";
import Loader from "@/components/ui/Loader";
import PostLayout from "@/components/layouts/PostLayout";

function MyApp({ Component, pageProps }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const shouldShowLoader = !isMounted || isLoading;
  const { title, allPosts, allContents } = pageProps;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
   
        <>
          {router.asPath == "/" ? (
            <Component {...pageProps} />
          ) : (
            <PostLayout
              title={title}
              allPosts={allPosts}
              allContents={allContents}
            >
              <Component {...pageProps} />
            </PostLayout>
          )}
          {shouldShowLoader && (
            <div className="fixed inset-0 z-[1145] bg-neutral-100 dark:bg-neutral-900">
              <Loader />
            </div>
          )}
        </>
    </ThemeProvider>
  );
}

export default MyApp;

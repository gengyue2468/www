import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/geist";
import "@fontsource-variable/newsreader/wght-italic.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import Head from "next/head";
import { useState, useEffect } from "react";

export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <>
      {" "}
      {isClient && (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Head>
            <link
              href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap"
              rel="stylesheet"
            />
          </Head>
          <Component {...pageProps} />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      )}
    </>
  );
}

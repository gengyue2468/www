import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/inter";
import "@fontsource-variable/newsreader";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useState, useEffect } from "react";
import 'moment/locale/zh-cn';
import moment from "moment";

export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);
  moment.locale('zh-cn');

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <>
      {isClient && (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Component {...pageProps} />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      )}
    </>
  );
}

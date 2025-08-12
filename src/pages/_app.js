import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import "@fontsource-variable/jetbrains-mono";
import "react-lazy-load-image-component/src/effects/opacity.css";
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
        </ThemeProvider>
      )}
    </>
  );
}

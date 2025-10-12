import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

import "@/styles/globals.css";
import 'katex/dist/katex.min.css';

export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {ready && <Component {...pageProps} />}
    </ThemeProvider>
  );
}

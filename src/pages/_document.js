import Document, { Html, Head, Main, NextScript } from "next/document";
import { site } from "@/lib/site.config";

class MyDocument extends Document {
  render() {
    const fontStyles = `
      @font-face {
        font-family: "Helvetica";
        src: url(/fonts/helvetica-now-var.woff2) format("woff2");
        display: swap;
      }
      
      @font-face {
        font-family: "FF Hei";
        src: url(/fonts/ff-hei.woff2) format("woff2");
        display: swap;
      }

      @font-face {
        font-family: "MTR Song";
        src: url(/fonts/MTR-Sung.woff2) format("woff2");
        display: swap;
      }
    `;

    return (
      <Html lang="zh">
        <Head>
          <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

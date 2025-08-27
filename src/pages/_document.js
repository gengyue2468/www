import Document, { Html, Head, Main, NextScript } from "next/document";
import { site } from "@/lib/site.config";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh" className="scroll-smooth">
        <Head>
          <link
            rel="stylesheet"
            href="https://www.unpkg.com/font-online/css/alibaba-pu-hui-ti-3.online.css"
          />
          <meta name="baidu-site-verification" content="codeva-oEVYBxMiFf" />
          <meta
            name="msvalidate.01"
            content="CDD3780C78E36A5FDE9832782F311A6C"
          />
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

---
title: 利用 Bun 的最新内置 API Bun.Webview 搭建轻量网页抓取小玩具 Fig
date: 2026-05-11
summary: 本文介绍了如何利用 Bun 的实验性 API `Bun.Webview` 构建一个轻量级网页抓取工具 Fig，重点解决了在 Windows 下连接 Chrome 后端的问题（通过远程调试端口和手动启动浏览器），并实现了 HTML 到 Markdown 的转换、自定义 User-Agent 插件绕过微信公众号风控，最终部署为 HTTP 服务，可集成到 QQ 机器人等场景中。
tags:
  - Bun
  - 技术
  - 项目
---
## 前言

[Bun](https://bun.com)在 1.3.12 版本之后内置了一个全新的 API `Bun.Webview`，可以实现一些简单的浏览器自动化，~~能够~~部分替代 [Playwright](https://playwright.dev/)的职能。哈，大好，试吃一下看看。[note: 请注意此 API 仍然处于实验状态， Bun 官方也承认 *This API is experimental and may change in future releases.*，并且存在一些神秘 Bug，建议用于测试而非生产环境。]

对于尊贵的 macOS 用户，`Bun.Webview` 可以直接调用系统原生的 `webkit` 作为 API 的后端。针对 Windows 或 Linux 平台，可以使用 chrome 作为 `Bun.Webview` 的后端，通过`const view = new Bun.WebView({ backend: "chrome" });`设置。[note: macOS 亦可通过此声明使用 chrome 而非 webkit 后端]

根据[Bun 的文档](https://bun.com/docs/runtime/webview#finding-the-chrome-executable)，Bun 会通过以下的顺序寻找 chrome 后端：

1. 在 `backend: { type: "chrome", path: "..." }` 下设置的 `path`
2. `BUN_CHROME_PATH` 环境变量 [note:**! 注意，这里有问题**，会在下面提到]
3. `$PATH` (`google-chrome-stable`, `google-chrome`, `chromium-browser`, `chromium`, `brave-browser`, `microsoft-edge`, `chrome`)`
4. 常见的安装目录
5. Playwright 的缓存 (`~/Library/Caches/ms-playwright` or `~/.cache/ms-playwright`) for `chrome-headless-shell`

## 集成 chrome 后端

但是在实际操作中，我发现无论在 Windows 下如何设置 `BUN_CHROME_PATH` ，Bun 似乎都无法正确的找到并启动 chrome 后端，即使你安装了 chrome、chromium 或者 edge。在 [Bun 的 Issue 区](https://github.com/oven-sh/bun/issues)找到了一个[类似的 Issue](https://github.com/oven-sh/bun/issues/29102)，看起来这是设计早期的缺陷，*应该*会在后续的版本中获得改进。

哎，只能换个方法了。观察到显式设置 chrome 后端的 `path` 似乎是个好主意！

chromium 系的浏览器都有一个模式可以开启远程调试，对于 chrome 而言，这个设置在 `chrome://inspect/#remote-debugging`，对于 edge，这个设置位于 `edge://inspect/#remote-debugging`。理论上，我们只需要在这里勾选 "Allow remote debugging for this browser instance"，浏览器就会自行启动一个位于 `127.0.0.1:9222` 的远程调试服务器。但是很奇怪，这在我的笔记本电脑上并不工作：**调试服务器确实在 9222 端口顺利运行了，但是预期的接口全部返回 404**，这很奇怪。

不过，天无绝人之路，我们可以通过命令提示符输入 `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222` 用 debugging 参数启动一个新的 edge 实例数[note: 如果后端起不来请尝试杀掉所有的 edge 进程]，这样调试服务器就能正常工作了，好耶！

下一步的工作是让 `Bun.Webview` 连上我们启动的后端，我们可以通过类似下面的 typescript 脚本获取浏览器的调试 Websocket 地址：

```typescript
import axios from "axios";

async function getBrowserDebuggingURL(): Promise<string> {
  try {
    const response = await axios.get("http://localhost:9222/json/version");
    return response.data.webSocketDebuggerUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`获取浏览器调试 URL 失败: ${message}`);
    throw new Error("获取浏览器调试 URL 失败");
  }
}

export { getBrowserDebuggingURL };
```

并在 `Bun.Webview` 的启动参数中 `await` 上面的异步函数返回的结果，就像：

```typescript
const view = new Bun.WebView({
  backend: {
     type: "chrome",
     url: await getBrowserDebuggingURL(),
  },
  headless: true,
 });
```

好耶，经过这一番操作，Bun 应该能顺利连上浏览器后端了。

## 抓取网页与格式化

`Bun.Webview` 的 API 和 playwright 基本上类似，我们可以通过类似下面的代码完成对网页的简单抓取：

```typescript
const title = await view.evaluate(`document.title
        || document.querySelector('meta[property="og:title"]')?.content
        || document.querySelector('meta[name="twitter:title"]')?.content
        || document.querySelector('h1')?.textContent?.trim()
        || document.querySelector('h2')?.textContent?.trim()
        || ""`);
const html = await view.evaluate("document.documentElement.outerHTML");
const text = await view.evaluate("document.documentElement.innerText");
```

对于抓取到的数据，我通过一个自定义的 `parser`，利用 `cheerio` 清理一下 DOM 结构，然后用 `@mizchi/readability` 尝试把 html 转换成 Markdown 格式：

```typescript
import { extract, toMarkdown } from "@mizchi/readability";
import * as cheerio from "cheerio";

function normalizeHtml(html: string) {
  try {
    const $ = cheerio.load(html);
    return $("body").html() ?? "";
  } catch (error) {
    console.warn("HTML 格式化失败:", error);
    return html;
  }
}

async function htmlParser(url: string, html: string): Promise<string> {
  try {
    const normalizedHtml = normalizeHtml(html);
    const extracted = extract(normalizedHtml, {
      charThreshold: 100,
    });
    if (!extracted?.root) {
      console.warn(`没有找到文章根元素 ${url}`);
      return "";
    }
    const parsed = toMarkdown(extracted.root);
    if (typeof parsed !== "string" || parsed.trim().length === 0) {
      console.warn(`Markdown 转换为空 ${url}`);
      return "";
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`HTML 解析失败: ${message}`);
    return "";
  }
}

export { htmlParser };
```

不幸的是，markdown 格式经常转换失败，[note: 猜测是因为库是基于阅读模式构建的，但是有些页面并不支持转换成阅读模式，所以在转换时会出错。考虑可以用 `turndown` 或者类似的库兜个底]这个时候就需要用 `innerText` 兜个底 —— 虽然 markdown 格式没了，但是至少不会返回令人诧异的空白。

用下面的 `curl` 命令测试一下：

```bash
curl -X POST http://localhost:9233/read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-magic-access-token" \
  -d '{"url":"https://www.gengyue.site"}'
```

返回结果类似：

```plaintext
---
title: gengyue
url: https://www.gengyue.site
---

# Hi 👋!

此地属于 gengyue。目前这个页面应该是被扔到 [Netcup](https://www.netcup.com/en?ref=366353) 的一台 VPS VPS Lite 2 G12s, 4 vCore (x86), 8 GB RAM, 160 GB SSD, Nürnberg, BY, DE  上了，利用 [Cloudflare](https://cloudflare.com/) 回源。

您可以通过阅读 [About](/about), [Blog](/blog) 和 [Logbook](/logbook) 页面了解更多信息，下面的链接亦可：

- 我的 Email: [hi@gengyue.site](mailto:hi@gengyue.site)
- 我的 GitHub: [@gengyue2468](https://github.com/gengyue2468)
- 我的 Memos: [https://memos.gengyue.site](https://memos.gengyue.site)

‍ **Linus Torvalds** is the Finnish-American software engineer who created the Linux kernel, the foundation of countless open-source operating systems. ![Linux 企鹅](/static/og/tux.gif)

... truncated
```

## UA 与插件系统

启动成功了自然要测一下常见的网站能不能爬，例如知乎、小红书、微信公众号。奇怪的是，知乎、小红书都是正常的，不幸的是，微信被风控拦了，但是我们是聪明的工人智能，可以想到伪造一点 UA 绕过限制，虽然看起来比较绿皮科技，但是确实有效。

预制了一点 UA，仅供参考：

```typescript
export const UA_PRESETS = {
  iPhone_WebView: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49",
  iPhone_Safari: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  Android_WebView: "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36 MicroMessenger/8.0.49",
  Android_Chrome: "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.119 Mobile Safari/537.36",
  Desktop_Chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Desktop_Safari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  Baidu_Spider: "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
  Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",

} as const;
```

经过实测，伪造一个 iPhone Webview 的 UA 就可以绕过微信公众号的限制！参考 `wechat.ts` 插件：

```typescript
import type { UAPlugin } from "../registry";
import { UA_PRESETS } from "../presets";

const WECHAT_DOMAINS = [
  "mp.weixin.qq.com",
  "channels.weixin.qq.com",
  "weixin.qq.com",
  "open.weixin.qq.com",
];

const wechatPlugin: UAPlugin = {
  name: "wechat",
  match(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return WECHAT_DOMAINS.some((domain) => hostname === domain || hostname.endsWith("." + domain));
    } catch {
      return false;
    }
  },
  getUserAgent(_url: string): string {
    return UA_PRESETS.iPhone_WebView;
  },
};
  
export default wechatPlugin;
```

然后在主逻辑中引用：

```typescript
const matchedUA = pluginRegistry.resolve(url);
      if (matchedUA) {
        await view.cdp("Network.setUserAgentOverride", { userAgent: matchedUA });
      }
```

> 这里有个细节，Bun 似乎没有直接的方法换 UA，这里通过 cdp 覆盖 chrome 后端的默认 UA 实现

好耶！爬爬

## 部署

最初写这个小玩具也是为了和 QQ 机器人结合，于是用 Bun + Hono 搭了一个简易的 HTTP 后端。部署这个 Hono 程序很简单，只需要在小鸡上 clone 仓库然后 `bun i` 然后用 `pm2` 持久化启动一下就好。

chrome 后端我们选用的是 `chromium` ，在 Ubuntu Server 上，通过以下命令安装：

```bash
sudo apt update
sudo apt install -y ca-certificates fonts-liberation fonts-noto-cjk
sudo apt install -y chromium-browser
```

为了让浏览器看起来更像真人，我们安装  `xvdf` 以让 chromium 以非 `headless` 模式启动！

为了持久化运行，我们创建一个 `systemd` 进程，编辑  `~/.config/systemd/user/chromium.service`:

```plaintext
[Unit]
Description=Chromium Browser
After=network.target

[Service]
ExecStart=/usr/bin/xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24" \
    /usr/bin/chromium-browser \
    --no-sandbox \
    --disable-dev-shm-usage \
    --remote-debugging-port=9222 \
    --remote-debugging-address=127.0.0.1 \
    --user-data-dir=/tmp/chrome-debug-profile \
    --disable-blink-features=AutomationControlled \
    --disable-features=IsolateOrigins,site-per-process \
    --disable-infobars \
    --disable-component-update \
    --lang=zh-CN \
    --window-size=1920,1080 \
    https://www.google.com
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
```

然后启动服务并设置开机自启：

```bash
sudo systemctl daemon-reload
sudo systemctl start chrome-remote-debug.service
sudo systemctl enable chrome-remote-debug.service
```

测试一下：

```bash
curl -X POST http://localhost:9233/read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-magic-access-token" \
  -d '{"url":"https://www.gengyue.site"}'
```

好耶，跑起来了，下面就可以接入 QQ 机器人或者任何想要接入的场景了

## 后记

我把它命名为 `fig`，也就是**无花果**，或者过度解读一下，可能是 "Fetch Input (And) Generate" 的意思[note: 不过确实没有这么高级]，您可以在[GitHub](https://github.com/gengyue2468/fig)上读到这个绿皮科技的完整源码，可能这个小玩具不够稳定，但是它确实是我摇摇欲坠的基建的一部分了！

随着 Bun Webview API 的不断完善，这里的内容肯定会过时，我可能会跟随着更新...
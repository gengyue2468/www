---
title: OpenCode V2 Shared WebUI
date: 2026-10-17
tags:
  - Tools
  - Web
comment: true
---

> 以下是在[烧饼论坛](https://sb.sb)水帖的原文

众所不周知，OpenCode 于 2026 年 9 月 11 日正式发布了 v2，带来了一系列令人振奋的改进。其中一项就是 OpenCode 终于引入了一个 Shared Background Server. 

v1 中，OpenCode 的 Web 和 TUI 基本是各自独立的，Session 等状态难以共享；与此同时，每打开一个新的 OpenCode 窗口，都需要启动一套独立的进程，不仅造成了不必要的资源开销，也让跨窗口操作变得十分麻烦。 

而 v2 的 Shared Background Server 则很好地解决了这些问题：不同客户端现在可以连接到同一个后台服务，共享 Session 和运行状态，既减少了重复的资源消耗，也让多窗口、跨客户端的使用体验更加连贯。 

--- 

我们注意到这个 background server 实际上是在本机起了一个 http 服务器，默认是 `localhost:49374`。webui 和 tui 都共享这个 background server，有趣的是 `localhost:49374` 除了提供公共的 api 服务之外，还提供了一个还算不错的 webui。

众所周知，各位 B 友都有很多小鸡，小鸡上通常会有反向代理工具，例如 Caddy 或 Nginx，那么聪明如我的 B 友就会想到把这个反代一下~~暴露到公网让别人蹬光额度~~然后随时随地打开浏览器 vibe coding，比如写出这样的 Caddyfile:

``` caddyfile
opencode.i.gy.run {
         reverse_proxy http://127.0.0.1:49374
}
```

理论上打开 opencode.i.gy.run 就可以看到 opencode 的面板了 

不过... 

--- 

> 暴露到公网

让别人蹬光额度 OpenCode 官方也想到了这一点，所以提供了一个叫做 `opencode pair` 的工具把浏览器和 background server 配对在一起。因此我们甚至不需要我们特意的去配置 basic auth / tinyauth 等认证来保护这条路由。 ![image.webp](https://sb.sb.sb/attachments/qla5mep3pump/image.webp) 在未配对的情况下看到的如上图，只需要在小鸡上运行 `opencode pair` 即可获得一个 one-time 的 5 min 有效期的配对链接和二维码。注意，默认生成的认证链接默认的域名是 localhost，需要用 `--url` flag 手动指定为前面反代配置的域名用于浏览器认证，例如 `opencode pair --url https://opencode.i.gy.run`。 大调查了一下 OpenCode 的文档，这个认证会保存到浏览器 cookie，有效期大概 30d 

--- 

~~作为一个日常把 OpenCode 当 OpenClaw/ Hermes Agent·~~用的人，感觉这个还挺有用的，不然像之前一样拿手机 Termux 开 ssh 连到小鸡上也太卡了些，还容易断联，这样方便许多了...

---
title: 不要给 CliProxyAPI 套上 Cloudflare CDN
date: 2026-04-30
---

昨天晚上在 Netcup 的小鸡上部署 CliProxyAPI，一切挺顺利的，`curl` 测试也没啥问题。但是一旦用 OpenAI Client 接入就会报错 403 Request 被拒绝，很奇怪。

排查了一下发现似乎和加密有关系，看了一下后台的日志，发现 OpenAI Client 的请求压根没有打到服务器上，那看来是 Cloudflare 的问题了。

果然，手动给域名申请了 let's encrypt 的证书并关掉了 Cloudflare 的橙云就好了，太神秘了，大调查一下...

Updated 2026-05-01 12:23 AM

大调查有了大结果！果然是 Cloudflare 拦了请求，估计是当成 AI Crawl 或者 Bot 之类的自动化程序了...哎，改改 WAF 规则。

去 `Security -> WAF -> Rules` 新建一个规则，表达成 `http.user_agent contains "OpenAI"`，Actions 选 Skip，然后去把橙云打开！

握草这校园网半夜怎么又断了啊，开热点电脑上 Cloudflare 好慢...

哦齁齁，错怪流量了，是我的代理有问题，不管了，修好了...

哎 Cloudflare 怎么这么好啊，Cloudflare 怎么又这么坏啊...

---
title: 不要给 CliProxyAPI 套上 Cloudflare CDN
date: 2026-04-30
---

昨天晚上在 Netcup 的小鸡上部署 CliProxyAPI，一切挺顺利的，`curl` 测试也没啥问题。但是一旦用 OpenAI Client 接入就会报错 403 Request 被拒绝，很奇怪。

排查了一下发现似乎和加密有关系，看了一下后台的日志，发现 OpenAI Client 的请求压根没有打到服务器上，那看来是 Cloudflare 的问题了。

果然，手动给域名申请了 let's encrypt 的证书并关掉了 Cloudflare 的橙云就好了，太神秘了，大调查一下...



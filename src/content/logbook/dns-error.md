---
title: DNS 解析问题
date: 2026-04-26
---

在家里的 iMac 上开了一个 6c 8g 的小鸡，但是发现连不上网，表现为 ip 能 ping 通但是 ping 不通域名，看来是 DNS 解析出问题了！

尝试搜索了一番，发现 `/etc/resolv.conf` 里的 `nameserver` 很奇怪，指向的是 `127.0.0.53`，是本地 IP 地址。了解了一下发现是 `systemd-resolve` 会默认用本地的这个地址作为 DNS 解析服务器连上游 DNS 解析提供商，但是看起来它坏掉了。试着改了改 `systemd-resolve` 的配置也没用，重启之后必掉线。直接改 `/etc/resolv.conf`也不现实，这货是一个软链接，每次系统启动的时候会被 `systemd-resolve` 自动改回去。

后来决定不折腾了，直接停了 `systemd-resolve`，把原来的 `/etc/resolv.conf` 软链接删了重新写一个 `/etc/resolv.conf` 文件指定：

```
nameserver 1.1.1.1 
nameserver 223.5.5.5 
```

哎就这么解决了，不依赖 `systemd-resolve` 了，现在 DNS 正常工作了，剩下的出问题再说吧...

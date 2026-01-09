---
tags: [Linux,WSL,开发]
title: 好神奇的 WSL!
date: 2025-12-19
summary: WSL 真的太神奇了！三个小字母，却能让 Linux 和 Windows 无缝融合。曾经为了 Linux 双系统折腾得头大，现在只需一行命令就能安装，选个发行版，设置好用户名密码，立马体验丝滑流畅的开发环境。耍帅、装逼、写代码，一切都so easy，只差微软给我打个广告费！
---

[WSL](https://learn.microsoft.com/zh-cn/windows/wsl/install)真是太神奇了，竟然这三个小小的字母竟可以拥有如此强大的功能和能量！

嘻嘻，long long ago，曾几何时，时间如白驹过隙，我曾经使用过 Linux，不过那个时候都是装的双系统或者什么的，主要就是 Ubuntu 之类的 Debian 系系统，
不过，受当时电脑配置的限制和我好奇心的消减以及 Linux 软件生态的过于贫瘠，使用过一段时间之后全部删干净了，回归~ ~~巨硬窗户~~！

但是，好神奇，WSL，可以将 Linux 与 Windows 如此巧妙地融合！现在开始，可能只需要一行命令和若干次重启：

```bash
wsl --install
```

嘻嘻，然后列出想要安装的 Linux 发行版列表，从arch到centos，再到ubuntu，可谓是琳琅满目，应有尽有啊：

```bash
wsl.exe --list --online
```

然后美美地选择一个发行版安装！美美地设置好用户名和密码！然后：

```bash
sudo apt update
sudo apt install neofetch
neofetch
```

耍帅时间到！哇，好帅，这一刻，show time has arrived! 原来安装 Linux 是为了装啊，一切，一切，都满足了。

![](/static/tech/neofetch.webp)

What are u waiting for? 现在开始，可能只需要一次安装！你将拥有和 Windows 无缝集成德芙般丝滑流畅的开发体验！

不过~~微软似乎忘记给我广告费了...~~
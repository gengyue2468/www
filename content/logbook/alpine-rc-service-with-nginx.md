---
title: Alpine 上的 rc-service 和 nginx 打架
date: 2026-07-11
---
最近在两台 1c 0.5g 的小鸡上装了 Alpine Linux 配了 nginx 并加了缓存，但是发现内存似乎会一点点漏，几个小时之后小鸡就 OOM 然后探针和 ssh 直接被杀掉了只能去面板重启。

一开始怀疑是 gzip 或者 nginx 长连接的锅，但是后边勉强 ssh 上去 top 了一下发现是 nginx cache manager 疯狂超开进程。

哎，想到之前调试脚本的时候 `rc-service nginx restart` 经常失效，会有残留的 nginx 死进程占着 80 和 443，导致必须手动 `kill` 掉残余的进程然后手动 `rc-service nginx start`。怀疑是杀掉 nginx 进程的时候没有同时杀掉 nginx cache manager 导致每次重启都超开，先改改脚本换用 `pkill nginx` 了...

说实话对 Alpine Linux 不是很懂，看起来需要抽时间大调查一下...
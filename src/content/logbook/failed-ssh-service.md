---
title: '坏掉的 ssh.service 启动项'
date: '2026-04-19'
---

每次打开 wsl 都会出现如下的报错，极其神秘：

```bash
Failed to start ssh.service: Unit ssh.service not found.
gengyue@gengyue-laptop:~$
```
怀疑是之前启用 openssh 但是之后删除的时候没有删除干净导致的，于是尝试手动删掉 openssh

坏，反复重新删除了好几次，wsl 也重启了好几次，但是没啥效果

Updated 2026-04-19

发现问题了，`cat ~/.bashrc` 发现里头竟然有手动写入的 ssh 启动项 `auto startup ssh` 和 `sudo service ssh start`，手动删除之后就好了。

哎，在这个过程中好像顺便发现了一个问题，wsl 启用 `systemd` 的配置文件好像不在 Windows 下的 `~/.wslconfig` 而是在 wsl 下的 `/etc/wsl.conf` 中，需要：

```
+[boot]
+systemd=true
```
这样 wsl 启动的时候就不会爆莫名其妙的 `wsl: Unknown key 'wsl2.systemd' in C:\Users\OMEN\.wslconfig:2` 错误了！

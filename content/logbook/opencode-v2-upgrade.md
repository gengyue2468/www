---
title: OpenCode V2 Upgrade
tags: [Tools, Models]
date: 2026-09-25
---
1. 插件会挂掉，这是一个 breaking change，使用了新的 sdk，因此旧插件会因为校验无法通过而爆炸。
2. 引入了新的 background server 机制，很好啊
3. wsl 的网络如果是 `mirror` 模式，更新之后需要手动指定 opencode service 的 `port`，否则可能会因为 Windows 下的 port 已被占用（而 wsl 内也查不到）而导致 opencode service 起不来。。。临时用可以试试 `opencode --standlone`，目前没找到能共用同一个后端的方式，猜测 需要处理一下 basic auth，可能要 hack 一下
4. 

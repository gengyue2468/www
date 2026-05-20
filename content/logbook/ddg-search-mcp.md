---
title: Duckduckgo 搜索 mcp
date: 2026-05-17
---
想着给 OpenCode 配一个搜索 MCP，这样 LLM 可以从自由的互联网上找到信息而不是靠自己的臆想和想象编造一些知识库中没有的东西了！

一开始随便找了一个社区维护的 MCP Docker，启动还是很顺利的，不过这个东西是用 Python 写的，启动之后占了 3GB+ 的内存，感觉就像一个黑箱，不知道里头是不是塞了一整个浏览器进去，哎，直接扔掉了。

---

经过能工智人和人工智能共同调用 `web_search` 工具的不懈搜索下，确实找到了一些社区维护的其它 mcp，语言五花八门的，最多的还是 Python，也有 Rust/Golang/TypeScript 写的，哎，看来 MCP 还是 Python 的天下啊。[^ 哎，谁让 Python 是 AI 时代的编程语言呢]

看了一些项目，不是很新就是很老，要么就是 0 Star，感觉不太靠谱，找了一个 `ghcr.io/nickclyde/duckduckgo-mcp-server:latest`  拉下来用了一下，窝趣还不错，内存控制的很好。

不过它在我的 Tailnet [^ Tailscale 组的大内网] 中不工作，大调查了一下发现好像是 Python 内部的某个神秘 SDK 会拦截 localhost 外的请求，导致在启动参数中指定对公网开放也不工作，哎，大神秘！

让 OpenCode 自己去探索了一番，和人类智能商讨了一下决定自己写一个 `start.py` 拦截内部的拦截，这样就可以在 tailnet 里自由冲浪了！

哎，实际操作下来问题还是不少的：

### 问题1：421 Misdirected Request

- 原因：FastMCP 初始化时 host 默认 127.0.0.1，自动启用 DNS rebinding 保护，只允许 localhost
- 解决：创建 `start.py`，初始化 FastMCP 时传入 `transport_security=TransportSecuritySettings(enable_dns_rebinding_protection=False)`

### 问题2：搜索工具报错

- 原因：`start.py` 中 `searcher` 初始化缺少 `safe_search` 和 `default_region` 参数，`fetch_content` 方法名错误
- 修复：从原模块导入 `SafeSearchMode`，初始化 `searcher` 时传入参数，工具函数改为调用 `fetcher.fetch_and_parse()`

### 问题3：客户端 -32602 错误

- 原因：Windows 客户端请求走了代理，无法访问 Tailscale 内网
- 解决：Windows 设置环境变量 no_proxy=ddg.gy.run,100.101.102.0

 最终启动方式：docker-compose 挂载 `start.py`，command 改为 `python /app/start.py`

---

其实这三部分并不完全是逻辑顺序，其实问题 3 放在这一部分之后比较好，不过为了保证 LLM 输出信息的完整性和连续性，还是放到第二部分比较合适 [^ 神秘描述]。

事实上，OpenCode 的 MCP Server 对地址的校验还是比较严格的，不允许你直接用 Tailnet 中的裸 IP 地址加端口访问，至少需要用一个域名例如 `ddg.gy.run` `A` 记录指向 Tailnet 的内网 IP 然后用域名:端口访问方可，虽然不知道这是甚么原因，但是这样至少能跑起来！

```json
"mcp": {
  "ddg-search": {
    "type": "remote",
    "url": "http://ddg.gy.run:9999/sse"
  }
}
```
---
哎，仔细想想 MCP 服务器应该还是跑在本机的[^ 本机跑本机用]，但是感觉内网共享一个也不是不行...

好像有了 [viewview](https://github.com/gengyue2468/viewview) 之后完全可以用 TypeScript 自己写一个 MCP 服务器用用，看看有没有时间研究一下子...不过近期~~可能~~绝对是没有时间了...



---
title: 原来 Hono 指定端口是通过 Runtime 控制的！
date: 2026-05-07
---
**Hono 本身只是路由框架**，不负责监听端口。

比如用 Bun 启动，应该这样指定端口：

```typescript
// export default app;
export default {
  port: 6478,
  fetch: app.fetch,
};
```
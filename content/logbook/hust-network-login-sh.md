---
title: hust-network-login-sh
date: 2026-09-10
comment: true
---
在路由器上配[BingyanStudio/hust-network-login-sh: 为非常嵌入的嵌入式设备设计的最小的最小化华中科技大学校园网络认证工具](https://github.com/BingyanStudio/hust-network-login-sh) 遇到的长时间 retry 的问题排查

其实是内置的 `encrypted` 脚本没法加密了，所以 `conf` 中的第二行必须填写加密之后的密码。具体需要从校园网登录认证门户页面使用浏览器开发工具将密码框的 `type=password` 改成 `type=text` 来把密文复制出去。

All done，工作正常。
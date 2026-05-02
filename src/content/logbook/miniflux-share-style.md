---
title: Miniflux 分享页样式美化
date: 2026-05-02
---

> 由 mimo v2.5 pro 生成

Miniflux 的分享页默认样式太丑了，想加点自定义 CSS 美化一下。本来以为直接在 Miniflux 设置里加自定义 CSS 就行，结果发现分享页有 CSP（Content-Security-Policy）限制，直接加样式会被浏览器阻止。

## 第一次尝试：Miniflux 自定义 CSS

失败。分享页的 CSP 头限制了 `style-src`，外部样式表和内联样式都被阻止了。

## 第二次尝试：nginx sub_filter 注入

决定在 nginx 层面搞，用 `sub_filter` 往分享页注入 CSS。结果又踩了几个坑...

### 坑 1：sub_filter 不生效

查了半天发现是后端返回了压缩内容，`sub_filter` 无法处理。加上这行就好了：

```nginx
proxy_set_header Accept-Encoding "";
```

### 坑 2：CSP 在 meta 标签里

本以为 `proxy_hide_header Content-Security-Policy` 就能搞定，结果发现 CSP 是写在 HTML 的 `<meta>` 标签里的，不在 HTTP 头。只能用 `sub_filter` 把它搞坏：

```nginx
sub_filter '<meta http-equiv="Content-Security-Policy"' '<meta http-equiv="X-Removed"';
```

### 坑 3：字体加载失败

中文字体死活加载不上。一开始用 `@import` 导入字体 CSS，结果 `@import` 里的相对路径 `url("./xxx.woff2")` 会相对于当前 CSS 文件解析，导致路径错误。

解决办法：不用 `@import`，直接用 nginx 注入多个 `<link>` 标签：

```nginx
sub_filter '</head>' '<link rel="stylesheet" href="https://rss.0w0.be/custom/fonts/.../result.css"><link rel="stylesheet" href="https://rss.0w0.be/custom/miniflux-share.css"></head>';
```

同时把 `result.css` 里的相对路径改成绝对路径：

```bash
sed -i 's|url("./|url("https://rss.0w0.be/custom/fonts/source-han-serif-cn-vf/|g' result.css
```

### 坑 4：Cloudflare 缓存

改了文件但死活不生效，最后发现是 Cloudflare 缓存了旧的 CSS。加个版本号 `?v=2` 就好了。

## 最终方案

把字体文件复制到 `~/infra/nginx/static/fonts/`，通过 nginx 的 `/custom/` 路径提供，加 CORS 头。然后用 `sub_filter` 往分享页注入两个 CSS 文件。

文件结构：

```
~/infra/nginx/static/
├── fonts/
│   ├── et-book-*.woff2
│   └── source-han-serif-cn-vf/
│       ├── result.css
│       └── *.woff2
├── globals.css
└── miniflux-share.css
```

折腾了一下午，总算搞定了...总结就是 nginx 的 `sub_filter` 真好用，但是坑也是真的多。

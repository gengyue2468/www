---
title: Colophon
description: 这个网站是如何构建的——技术栈、字体、部署等出版信息。
---
这个页面记录了这个网站的技术栈等信息。[^ 标题 "Colophon" 源自出版业的"版权页"或"出版信息"，通常记录书籍的排版、字体、印刷等信息。]

### 技术栈

- **运行时**：[Bun](https://bun.sh/) — 超快的构建
- **语言**：TypeScript，类型安全的 JavaScript [^ 哈，正如 C++ 并非 C with STL 一样，TypeScript 其实也并非 JavaScript with Types ]
- **Markdown 引擎**：[markdown-it](https://github.com/markdown-it/markdown-it) + 自定义的 Markdown 语法
- **CSS**：基于 [Tufte CSS](https://edwardtufte.github.io/tufte-css/)  — Edward Tufte 的极简主义风格，强调内容优先
- **部署**：我的 [Netcup](https://www.netcup.com/en?ref=366353) 小鸡上，利用 [Cloudflare](https://cloudflare.com) 回源

### 字体

使用两套字体来覆盖拉丁和 CJK 字符：

- **ET Book** — Tufte CSS 标配字体，基于 Edward Tufte 的书籍排版风格设计[^ ET Book 是 Tufte CSS 作者对 Bembo 字体的数字化修改版，专门为屏幕阅读优化。]
- **Source Han Serif VF** — Adobe 出品的思源宋体可变字体，用于中文排版
### 设计

这个网站的设计遵循几个简单原则：

- **内容优先** — 极少的交互，内容优先。
- **极简导航** — 主导航只有 4 个入口，更多的链接放在 [More+](/more) [^ 因为主导航超过 7 个链接会显著增加用户的认知负荷，所以我把次要入口都归到了 More+ 里。]
- **渐进增强** — 基本的 HTML 结构在几乎任何现代浏览器上都能正常工作，CSS 只是让它们更好看，起锦上添花而不是喧宾夺主的作用。
- **不追踪读者** — 自托管 Umami 例外

Last Updated: 2026/05/13
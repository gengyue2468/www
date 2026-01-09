---
title: 重构博客
date: 2026-01-09
tags: ['技术','前端','玩具项目']
summary: "用 Node.js + Markdown-It + Tufte CSS 重新打造的 0 运行时 JavaScript 的极简文件驱动博客，支持自定义路由、旁注语法和 TypeScript 构建流程，性能优先、排版优雅、内容完全自主可控。"
---

哎，虽然现在是期末周，明天还要考中国语文了。[^怎么理工科还要学语文啊！！！~~你问我啊，我问谁啊？~~]虽然我连考啥都不知道，这个学期学了啥我也不知道，~~但是也不想学习微积分了~~，于是在这里氵文一篇。

## 过去的方案：一个比一个重

之前的博客是用像 [Next.js](https://nextjs.org/) 这样的全栈 React 框架构建的，或者是 [React Router](https://reactrouter.com/) 这样的 SPA 框架构建的，反正一个比一个重、臃肿。亦或者是什么 [Hexo](https://hexo.io/)/[Hugo](https://gohugo.io/) 静态生成器，主题又不是完全可控。[^哎，我是大懒b，不喜欢改 Hugo/Hexo 的主题，但总是感觉有些地方不合自己的意。]

## 服务器闲置，于是我开始折腾

恰逢最近在腾讯云上买了一个轻量云服务器，除了跑一个 QQ 机器人之外大量的资源也就是闲置着。本来我准备让它跑个 [WriteFreely](https://writefreely.org/) 这样的带 [SQLite](https://www.sqlite.org/) 数据库的完整动态博客系统的。结果发现这货的可自定义性也太差了吧，对于习惯了文件驱动式路由的我简直是灾难，况且我也不会写 [Go](https://go.dev/)，自然 Hugo 也被我放弃了。[^哎，WriteFreely 似乎是为多用户优化的，单用户体验雀食挺差的]

此外还试了试 [Ghost](https://ghost.org/)/[Astro](https://astro.build/) 等等，不是太重就是我懒得改了，也就是放弃了。

哎，我灵光一闪，我自己搞一个框架，不久完全自主可控了？[^注意：是搞一个，具体怎么搞，那就不是那么回事了。~~自然不是我自己写了~~，不过期末周了，也没有时间写了，权当自己放松了]

## 最终选择：Tufte CSS 的复古浪漫

于是我看上了 [Tufte CSS](https://edwardtufte.github.io/tufte-css/)，根据作者的描述:[Tufte CSS](https://edwardtufte.github.io/tufte-css/) 是 [Edward Tufte](https://www.edwardtufte.com/) 风格的 CSS 框架，专注于简洁优雅的排版和侧边栏注释。

> Tufte CSS provides tools to style web articles using the ideas demonstrated by Edward Tufte's books and handouts. Tufte's style is known for its simplicity, extensive use of sidenotes, tight integration of graphics with text, and carefully chosen typography.

这很好，提供了很简约的设计，可以让网站看起来非常的复古且优雅，这正是我希望的！默认的字体是 ET Book，也是很优雅的西文，中文自动fallback 到 ui-serif 就很好了。[^不过移动设备大多没有系统衬线字体，这是个遗憾...]

## 10 分钟极速构建

于是我打开了 [Cursor](https://cursor.sh/)，对着它说：
> 请你参考 https://edwardtufte.github.io/tufte-css/，使用 [Node.js](https://nodejs.org/) 和 [Markdown It](https://github.com/markdown-it/markdown-it) 通过编译 Markdown 文件建立一个极简的个人网站/博客项目，要求具有下面的路由结构：
- `/`
- `/about`
- `/blog`
- `/blog/:slug`
每个页面都是由 Markdown 文档构建而成的纯静态 HTML 页面。同时，提取站点设置到 config.js 中统一管理。
对于 layouts，提取到/layouts/中统一管理。

然后 Cursor 帮我一通修改，`npm install` 安装依赖，然后 `npm run build` 测试构建，一通下来，成功地将静态文件输出到 `dist` 文件夹里头。好耶，我们就完成了，整个过程不超过 10 分钟。

## 让 CSS 也变得更干净

之后我们自然要对 Tufte CSS 的组织进行一些修改，比如，原来的 CSS 没有统一管理一些字体常量和颜色常量，所以我让 Cursor 把它们统统提取到 `:root` 中统一管理！好耶！现在看起来好多了。

### 设计旁注(Sidenote)语法

Tufte CSS 的一大亮点就是它的这个 Sidenote，很好玩，但是 Markdown 原生并不支持这种语法，于是我让 Cursor 帮我设计一种全新的语法，大概如下：
```
[^ xxx] //自动生成诸如 1 xxx 2 xxx 这样的旁注
[note: xxx] //自动生成无序号的旁注
```
测试构建，好耶，一切顺利！不过此时我发现 `build.js` 也膨胀到了 700 行的长度。于是我又对 Cursor 说：
> 请你重构 build.js，引入 [TypeScript](https://www.typescriptlang.org/) 支持并拆分成多个组件。对于 [RSS](https://www.rssboard.org/rss-specification)/[Sitemap](https://www.sitemaps.org/)/[Robots.txt](https://www.robotstxt.org/) 等文件的生成请尽量调用 npm 库而不是自行手动写逻辑。

又过了大概 10 分钟的时间，Cursor 完全构建了一个用 TypeScript 重构的构建流程，引入了类型安全机制，这很好。

到目前为止网站基本就可以用了，要想添加/删除/修改内容只需要简简单单地对对应的 Markdown 文件操作就可以了。[^要多简单有多简单]然后配置好 [Nginx](https://nginx.org/) 反代，访问 http://ip地址 就美美成功了。

## 最爽的特点：运行时 0 JavaScript

而且，这个网站最大的特点是：别看**构建时用了 JavaScript 脚本，但运行时没有任何的 JavaScript 脚本**。整个 DOM 结构干干净净，没有 React 的虚拟 DOM 机制，就像一个初出茅庐的人第一次写 HTML 文档一样，一切都是那么的自然，你写的只是内容，JavaScript 只是在帮你构建你的内容。因此，得益于这套机制，网站的性能十分的高。在 [Lighthouse](https://developers.google.com/web/tools/lighthouse) 测试后得到了几乎满分的成绩，这很好，在 1s 内加载好页面很不错，用户不会因此失去耐心而关闭你的网页。[^ 虽然没有 Ajax，在页面间路由的浏览器刷新感知却很小，~~不像 Next 的夸张路由，等半天都没有反应...~~]

好吧，现在已经 1 月 10 号了，我觉得写这么多已经足够了，我 run 一下 `npm run build` 然后 `commit` 一下就睡觉，好好。

## 部署也极简

> 对了，你完全没有必要再本地`npm run build`然后费力打包`dist`文件夹上传到 Git 或者你的服务器。像 [Vercel](https://vercel.com/) 或者 [Cloudflare Pages](https://pages.cloudflare.com/) 这样的构建网站，你只需要自定义你的构建命令为`npm run build`，指定输出目录为`/dist`就可以了。

缺点可能是在开发中吧，`npm run dev` 没有热更新，不过也没必要了，我们要的是一个内容驱动的网站。**既然你的工作主要是在编写 Markdown 文档，那开发服务器又和你有什么关系呢**，又没有必要去动那些 CSS/ Layout HTML，你只需要写 Markdown，剩下的交给构建就可以了，这也是一个比较完美的 SSG（静态站点生成）流程了！

晚安 :)








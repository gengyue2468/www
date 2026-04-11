---
title: 网页离开了 CSS 和 JS 还有可读性吗？
date: 2026-04-02
tags:
  - 前端
  - 技术
  - 故事
---
我一直认为现代 HTML5 的语义化标签是阅读优化的、利于 SEO 的，并且语义化标签是对人类和机器都很有好的一种表示：人类可以通过精妙的网页排版辨识出页面的标题、副标题、正文等元素，也可以通过`section` 等标签判断出所谓的“区域”。同样，机器也可以辨识出网页具有的各个部分，利于搜索引擎爬虫和各种 SEO 和无障碍优化。

CSS 和 JavaScript 为现代网站提供了锦上添花的效果：前者负责美化页面，让用户感觉很舒服；后者负责丰富网页的交互，让用户能够参与其中。

但是，我有个问题：**我们真的需要依靠复杂的 CSS 样式和 JS 脚本去复杂内容站吗？不管是塞入大量的无用的动画脚本或 CSS，轻量的或臃肿的追踪用户的脚本，甚至莫名其妙地弹出一个您是否同意使用小饼干[^ Cookie]的神秘弹窗。**

HTML 本身就是一种**超文本标记语言**[^ https://zh.wikipedia.org/wiki/HTML5]，所以自然可以用于排版。事实上，如果我们能够真正地尊重语义化标准，通过合理的 HTML5 标签就可以排出相当美丽的网页版式。

例如：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Blog Article</title>
</head>
<body>

<header>
    <h1>My Blog</h1>
    <nav>
        <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Articles</a></li>
            <li><a href="#">About</a></li>
        </ul>
    </nav>
</header>

<main>

    <article>

        <header>
            <h2>How to Build a Semantic HTML Blog Page</h2>
            <p>
                Published on 
                <time datetime="2026-04-02">April 2, 2026</time>
                by <strong>John Doe</strong>
            </p>
        </header>

        <section>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                laboris nisi ut aliquip ex ea commodo consequat.
            </p>
        </section>

        <figure>
            <img src="https://picsum.photos/200/300" alt="Sample Image">
            <figcaption>Figure 1: Example placeholder image</figcaption>
        </figure>

        <section>
            <h3>Why Use Semantic Tags?</h3>
            <p>
                Duis aute irure dolor in reprehenderit in voluptate velit 
                esse cillum dolore eu fugiat nulla pariatur.
            </p>

            <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa 
                qui officia deserunt mollit anim id est laborum.
            </p>
        </section>

        <blockquote>
            <p>
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
            </p>
        </blockquote>

        <section>
            <h3>Key Points</h3>
            <ul>
                <li>Lorem ipsum dolor sit amet</li>
                <li>Consectetur adipiscing elit</li>
                <li>Sed do eiusmod tempor</li>
            </ul>
        </section>

        <footer>
            <p>Tags: <a href="#">HTML</a>, <a href="#">Web Development</a></p>
        </footer>

    </article>

    <aside>
        <h3>About the Author</h3>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
    </aside>

</main>

<footer>
    <p>&copy; 2026 My Blog. All rights reserved.</p>
</footer>

</body>
</html>
```

> 这个页面全部依靠 HTML5 语义化标签进行，没有 CSS 和 JavaScript 参与。不过严格说，展示的是浏览器自带 CSS 的样式，这里更多的指的是没有自定义 CSS 参与。

效果如下：

:::fullwidth

![纯 HTML5 排版效果](/static/tech/html.webp)

:::

其实效果还是可以看的，也就是说，**网页离开了CSS 和 JavaScript，并不像鱼儿离开了水，彻底失去了生命力，它依然可以很好地活着** [note: 这里只针对类似的静态网页]

当前，相当部分的网页依赖 React 或者 Vue 框架渲染，此类框架在 SSR 或纯客户端渲染类似 SPA 的情况下是严重依赖 JavaScript 的。此时，SSG 就提供了一个还算不错的替代方案，Astro 就是这方面的先驱。

**那么，CSS 和 JavaScript 是完全无用的喽？**

显然不是，我们不会否认 CSS 和 JavaScript 作为网页三件套的另外两架马车的地位，我们只是强调**Webpage 并非离不开 CSS  和 JavaScript 的高级功能，HTML5 的粗鄙依旧能打**。

对于**内容驱动的网页**来说，最理想的状态就是 SSG 或者纯静态网页，我们希望 **HTML 作为底层，CSS 作为点缀，JavaScript 并非必要**，理想状态是 JavaScript 按需加载[note:本网站的 Mermaid.js 就是在构建时按需注入的，通过扫描文章是否存在`mermaid`代码块按需加载 Mermaid.js]，核心 CSS 内联展示，对于不强调重交互的内容站而言，我认为这是最佳实践。

对于**交互网页**而言，JavaScript 依旧是实现交互必不可少的一环，但是良好的语义化标签命名依旧是一个好习惯，不仅利于 SEO，而且有利于无障碍。

曾几何时，所有的按钮都是`div`，**而在 2026 年，前端又一次将死之时，希望给 LLM 留下的是一个充满语义化标签的前端规范，而不是一地鸡毛的别样的`div`大战。**


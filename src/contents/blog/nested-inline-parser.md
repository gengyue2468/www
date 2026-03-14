---
title: 简单的标记嵌套处理
date: 2026-02-13
summary: 手写支持嵌套的文本解析器，栈处理括号匹配，递归构建 AST。
tags: ['技术']
---

哎，博客系统偷懒是 vibe 出来的，其中自定义语法还蛮多的，比如 `[note: <content>]` [note: 这里的 `content` 支持嵌套的 markdown 语法]，好奇背后的原理是什么，研究一下。

目标：

```
我很[danger:危险]，请[warn:小心]，但我也有[success:优点]。
-> <p><span>我很</span><span class="text-red-500 bg-red-50 dark:bg-red-900/25"><span>危险</span></span><span>，请</span><span class="text-yellow-500 bg-yellow-50 dark:bg-yellow-900/25"><span>小心</span></span><span>，但我也有</span><span class="text-sky-500 bg-sky-50 dark:bg-sky-900/25"><span>优点</span></span><span>。</span></p>
```

emm，一开始想想用正则表达式匹配一下，比如：

```js
function parseSentence(sentence) {
  const regex = /\[([a-z]+):([^\]]+)\]/g;
  let match;
  let lastIndex = 0;
  const result = [];

  while ((match = regex.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        text: sentence.slice(lastIndex, match.index),
      });
    }
    result.push({
      type: match[1],
      text: match[2],
    });

    lastIndex = regex.lastIndex;
  }
  if (lastIndex < sentence.length) {
    result.push({
      type: "text",
      text: sentence.slice(lastIndex),
    });
  }
  return result;
}
```

通过记录 `lastIndex` 和正则表达式的匹配把文字对应的 `type` 和 `content` 塞到 `result` 数组里头。这对于普通语法来说很不错，不过遇到下面这种情况，大失败！[note:正则表达式本质上无法正确处理任意层级的嵌套结构（除非引入扩展特性）。因为括号嵌套属于「上下文无关语言」，而经典正则只能处理「正则语言」。。]

```
[danger:危机中孕育着[success:希望]，请[warn:务必小心]]！
-> <p><span></span><span class="text-red-500 bg-red-50 dark:bg-red-900/25"><span>危机中孕育着</span><span class="text-sky-500 bg-sky-50 dark:bg-sky-900/25"><span>希望</span></span><span>，请</span><span class="text-yellow-500 bg-yellow-50 dark:bg-yellow-900/25"><span>务必小心</span></span><span></span></span><span>！</span></p>

这是一个[warn:嵌套了[danger:危险]和[success:成功]的警告]，请注意！
-> <p><span>这是一个</span><span class="text-yellow-500 bg-yellow-50 dark:bg-yellow-900/25"><span>嵌套了</span><span class="text-red-500 bg-red-50 dark:bg-red-900/25"><span>危险</span></span><span>和</span><span class="text-sky-500 bg-sky-50 dark:bg-sky-900/25"><span>成功</span></span><span>的警告</span></span><span>，请注意！</span></p>
```

哎，看起来需要手动维护一个匹配完整 `[` 和 `]` 闭合嵌套的逻辑了！思路可以是，先找到某个 `[`标记，找到与之对应的 `]` 标记，对于这部分，前面和后面递归解析，对于中间部分，由于结构是 `type:content` 于是可以按 `:` `split` 成两部分，作为 `type` 和 `content` ，对于新的 `content` 继续递归解析，哇哦，虽然时间复杂度高了点，但是能跑！

定义 `interface`：

```ts
interface TextPart {
  type: string;
  content: string | TextPart[];
}
```

```ts
function parseText(text: string): TextPart[] {
  const start = text.indexOf("[");
  if (start === -1) {
    return [{ type: "text", content: text }]; // 如果不存在起始符 [，说明是纯文本
  }

  const end = findMatchingBracket(text, start); // 找到与 start 对应的 ]，保证嵌套正确
  if (end === -1) {
    return [{ type: "text", content: text }];
  }

  const before = text.slice(0, start);
  const inside = text.slice(start + 1, end); //格式 type:content，按 : 分割，解析 type 和 content
  const after = text.slice(end + 1);

  const [type, ...rest] = inside.split(":"); // type 作为冒号前的部分，content 作为冒号后的部分
  const content = rest.join(":"); // join 回内容，继续解析 content

  return [
    ...parseText(before),
    { type, content: parseText(content) },
    ...parseText(after),
  ];
}
```

`findMatchingBracket` 函数是用于寻找与 `start` 对应的 `[` 对应结束的 `]` 标签的 `index`，逻辑如下：

```ts
function findMatchingBracket(text: string, start: number): number {
  let count = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "[") count++;
    else if (text[i] === "]") count--;
    if (count === 0) return i;
  }
  return -1;
}
```

遇到 `[` 让 `count` 自增，遇到 `]`让 `count` 自减，直到 `count` 为 0 表明嵌套闭合。

配合上前端嵌套渲染逻辑：

```ts
function renderPart(part: TextPart, index: number): React.ReactNode {
  if (part.type === "text") {
    return <span key={index}>{part.content as string}</span>;
  }

  const children = (part.content as TextPart[]).map((child, i) =>
    renderPart(child, i),
  );

  switch (part.type) {
    case "danger":
      // danger render goes here
    case "warn":
      // warn render goes here
    case "success":
      // success render goes here
    default:
      return <span key={index}>{children}</span>;
  }
}
```

最终结果：

<iframe
  src="https://d.gengyue.site/embed/parseCustom"
  title="解析自定义文本语法"
  loading="lazy"
  style="width:100%; height:500px; border:none; border-radius:0.5rem;"
></iframe>

哎，不过发现这一套还是有些问题的：[note:按理说应该有错误处理的，而不是简单的直接当作自然语言输出了...或者至少对脚注这样的 Markdown 语法要有一定的的豁免/例外处理]

- 要求语法必须严格匹配，但是一旦用于 Markdown 渲染可能某些地方需要表示脚注这套解析就废了。
- 同上，如果有个伙计故意不闭合`[]` 或者 `: `写成`：` 都会导致整套逻辑垮台。
- 算法并非很优，时间复杂度 O(n^2)，很屎山。

所以为啥不直接用成熟的 `markdown-it` 之类的库呢 🤔
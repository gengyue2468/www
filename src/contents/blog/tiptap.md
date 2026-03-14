---
tags: ['技术']
title: 组会分享:神奇的 Tiptap 编辑器
date: 2025-12-20
summary: Tiptap 富文本编辑器分享，无头设计、插件丰富，适合高度定制场景。
---

## 简介

最近在写 [BuddyUp](https://buddyup.top/)的前端，其中文书生成之后需要一个编辑器（进行一些修改），
简单的`contentEditable`怎么能行！于是就寻找一个功能丰富、配置简单的富文本编辑器，于是就接触到了大名鼎鼎的 [Tiptap](https://tiptap.dev)，[^ ![Tiptap](/static/tech/tiptap.webp)
<strong>Tiptap</strong> 是一个开源的富文本编辑器框架，基于 ProseMirror 构建，具有高度的可定制性和扩展性。它支持 Vue 和 React 的集成，并拥有丰富的插件生态。]
下面粘贴一段简介，先水几行：

> **Tiptap 是一个开源的富文本编辑器框架**，基于 ProseMirror 构建，具有高度的可定制性和扩展性。它允许开发者轻松构建功能强大的在线文本编辑工具，适用于博客、论坛、协作文档等多种场景。

> Tiptap 提供了模块化设计，所有功能都通过扩展实现，开发者可以根据需求选择和配置扩展。此外，它支持 Vue 和 React 的集成，并拥有丰富的插件生态，如表格、代码块、任务列表等，满足复杂的文本编辑需求。

简而言之，Tiptap提供了无样式的、可拓展的无头富文本编辑器，十分适合开发中需要大段文字编辑的场景。我们开箱即用，拿来就用，十分符合鲁迅的风格！

## 使用

### 安装

Tiptap 的入门方法并不困难，我们直接 CV 命令过来，就像这样：

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

### 集成

通过下面的代码，我们可以轻松初始化一个 Tiptap 编辑器示例，这就像踩死一只蚂蚁那样简单。不过，注意第 10 - 11 行，如果正在使用 SSR，请务必这么设置。

```jsx {10, 11}
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
```

### 插件配置

Tiptap 具有[丰富的插件配置](https://tiptap.dev/docs/editor/core-concepts/extensions)，默认情况下，`StarterKit`就集成了丰富的内容：

[fold:Nodes（节点）]

- [Blockquote](https://tiptap.dev/docs/editor/extensions/nodes/blockquote)
- [BulletList](https://tiptap.dev/docs/editor/extensions/nodes/bullet-list)
- [CodeBlock](https://tiptap.dev/docs/editor/extensions/nodes/code-block)
- [Document](https://tiptap.dev/docs/editor/extensions/nodes/document)
- [HardBreak](https://tiptap.dev/docs/editor/extensions/nodes/hard-break)
- [Heading](https://tiptap.dev/docs/editor/extensions/nodes/heading)
- [HorizontalRule](https://tiptap.dev/docs/editor/extensions/nodes/horizontal-rule)
- [ListItem](https://tiptap.dev/docs/editor/extensions/nodes/list-item)
- [OrderedList](https://tiptap.dev/docs/editor/extensions/nodes/ordered-list)
- [Paragraph](https://tiptap.dev/docs/editor/extensions/nodes/paragraph)
- [Text](https://tiptap.dev/docs/editor/extensions/nodes/text)

[/fold]

[fold:Marks（标记/格式）]

- [Bold（加粗）](https://tiptap.dev/docs/editor/extensions/marks/bold)
- [Code（行内代码）](https://tiptap.dev/docs/editor/extensions/marks/code)
- [Italic（斜体）](https://tiptap.dev/docs/editor/extensions/marks/italic)
- [Link（链接）](https://tiptap.dev/docs/editor/extensions/marks/link) *(v3 新增)*
- [Strike（删除线）](https://tiptap.dev/docs/editor/extensions/marks/strike)
- [Underline（下划线）](https://tiptap.dev/docs/editor/extensions/marks/underline) *(v3 新增)*

[/fold]

[fold:Extensions（扩展功能）]

- [Dropcursor（拖拽光标）](https://tiptap.dev/docs/editor/extensions/functionality/dropcursor)
- [Gapcursor（间隙光标）](https://tiptap.dev/docs/editor/extensions/functionality/gapcursor)
- [Undo/Redo（撤销/重做）](https://tiptap.dev/docs/editor/extensions/functionality/undo-redo)
- [ListKeymap（列表快捷键映射）](https://tiptap.dev/docs/editor/extensions/functionality/listkeymap) *(v3 新增)*
- [TrailingNode（尾随节点）](https://tiptap.dev/docs/editor/extensions/functionality/trailing-node) *(v3 新增)*

[/fold]

如果不想要这么多插件，我们就妙妙禁用它们！

```jsx {9, 12, 13, 14}
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

const editor = new Editor({
  content: "<p>Example Text</p>",
  extensions: [
    StarterKit.configure({
      // Disable an included extension
      undoRedo: false,

      // Configure an included extension
      heading: {
        levels: [1, 2],
      },
    }),
  ],
});
```

## 实践

### 实用插件

在这里列出一些使用性较强的插件，氵几行：

#### [**Placeholder**](https://tiptap.dev/docs/editor/extensions/functionality/placeholder#placeholder)

嘻嘻，一个美观的`Placeholder`插件

```jsx {6-13}
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: "Write something …",
      // Use different placeholders depending on the node type:
      placeholder: ({ node }) => {
        if (node.type.name === "heading") {
          return "What’s the title?";
        }

        return "Can you add some further context?";
      },
    }),
  ],
});
```

#### [**BubbleMenu**](https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu)

这个插件实现了一个悬浮菜单，选中部分文字的时候会显示一个浮动工具栏，省去了手动计算并且实现的麻烦（偷懒…

#### [**CharacterCount**](https://tiptap.dev/docs/editor/extensions/functionality/character-count)

顾名思义，算字符数和单词数的()

#### [**Drag Handle**](https://tiptap.dev/docs/editor/extensions/functionality/drag-handle)

想把节点随意拖来拖去？这个绝对适合你！

当然还有很多，可以自由地探索！不过，注意 Tiptap 是有付费机制的，所以说并不是所有插件都是可用的...

### 自定义插件

TipTap 丰富的可拓展性亦体现在其可以自定义插件，为编辑器添加丰富多彩的效果，比如下面这个用在 BuddyUp 编辑器里的自定义翻译块插件：

```jsx {10-17}
/* eslint-disable @typescript-eslint/no-explicit-any */
import Paragraph from "@tiptap/extension-paragraph";

export const ParagraphWithTranslation = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      translationId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-has-translation"),
        renderHTML: (attributes) => {
          if (!attributes.translationId) {
            return {};
          }
          return {
            "data-has-translation": attributes.translationId,
          };
        },
      },
    };
  },
});
```

我们通过自定义插件扩展了Paragraph节点，添加了一个translationId属性。

**解析时（parseHTML）**：当编辑器从HTML加载内容时，如果遇到有`data-has-translation`属性的段落，就把这个属性值提取出来，存储为节点的`translationId`属性。

**渲染时（renderHTML）**：当编辑器输出HTML时，如果节点有`translationId`属性，就在输出的HTML元素上添加`data-has-translation`属性。

这样，前端就可以通过CSS选择器`p[data-has-translation]`为这些段落添加特殊样式，实现翻译块的视觉区分。并且，我们也可以通过`data-has-translation`控制翻译行为，防止重复翻译。

### 自定义 UI

由于 Tiptap 是 headless 的，所以我们自然需要对其进行一些妙妙美化，[Shadcn UI](https://ui.shadcn.com) 就还不错，不过，似乎不是讨论的重点了。

## 总结

总而言之，Tiptap 非常适合处理一些需要富文本编辑的场景，既省去了手动写逻辑的麻烦，简化了实现方法，又规避了老旧富文本编辑器上手难，UI 难以控制的问题。
所以，针对来讲，是一个很不错的轻量化解决方案。所以，[Check it out →](https://tiptap.dev)

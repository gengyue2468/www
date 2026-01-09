---
tags: [HUST,玩具项目,前端,API]
title: 小玩具:HUST 吃饭
date: 2025-12-15
summary: 吃饭这件事，也可以用代码玩出花样！本文介绍了用 Next.js 重写的 HUST 食堂信息小玩具，通过爬取官网、清洗数据、计算当前开放状态，你就能随时知道哪家食堂开门，还能轻松集成到自己的 bot 中，让吃饭变得科技感满满——从此再也不用盲目问“哪家食堂开门啦？”
---

灵感是上边这个👆，原项目是用 perl 写的，奈何本人并不会写 perl ，并且 perl 对于我而言针对 web 集成而言其实相当不友好，于是决定用 next.js 重写一个版本，嘻嘻，这下配置容易些了。[^原项目：<a href="https://github.com/jyi2ya/HUST-Chifan">HUST-Chifan</a> (Perl 版本)]

## 核心

核心原理其实很简单，我们通过`cheerio`爬取华中科技大学后勤处官网的链接（上面包含着各个食堂的营业时间等等），然后我们针对性的进行一些处理：

## 开发

```typescript title="/api/canteen/route.ts"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { parseCanteenTd } from "@/lib/parseCanteen";
import * as cheerio from "cheerio";

export async function GET() {
  const html = await fetch("https://hq.hust.edu.cn/ysfw/stfw.htm").then((r) =>
    r.text()
  );
  const $ = cheerio.load(html);

  const canteens: any[] = [];

  $("td[valign='top']").each((_, td) => {
    const tdHtml = $.html(td);
    const parsed = parseCanteenTd(tdHtml);
    if (parsed.name) canteens.push(parsed);
  });

  return NextResponse.json({ canteens });
}
```

嘻嘻，由你所见，我们只是`fetch`了一下静态的html页面，然后利用cheerio加载，找到匹配的`td[valign='top']`元素，然后对其进行一些处理：

```typescript title="/lib/parseCanteen/route.ts"
import * as cheerio from "cheerio";

export function parseCanteenTd(tdHtml: string) {
  const $ = cheerio.load(tdHtml);

  const name = $("strong span")
    .text()
    .replace(/^\d+、?/, "")
    .replace(/\s+/g, " ")
    .trim();

  const times: { meal: string; start: string; end: string }[] = [];

  $("p").each((_, p) => {
    const text = $(p).text().replace(/\s+/g, " ").trim();

    const match =
      /(早餐|中餐|午餐|晚餐|早、中餐)\s*(\d{1,2}[:：]\d{2})\s*[-–~]\s*(\d{1,2}[:：]\d{2})/.exec(
        text
      );

    if (match) {
      let [start, end] = match.slice(2);
      const meal = match[1];

      start = start.replace("：", ":");
      end = end.replace("：", ":");

      times.push({ meal, start, end });
    }
  });

  return { name, times };
}
```

然后我们用正则表达式清洗掉鲨臂官网上乱七八糟的标题文本，然后匹配`match`的文本，注意，HUST有些食堂标注的是“早、午餐”，很是神奇。

现在，我们就得到了干干净净的数据，我们就可以把这些数据乖乖地`push`到我们构建的数组中咯！

同样地，对于`/api/open-now`，我们进行一些处理：

```typescript title="/api/open-now/route.ts"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const data = await fetch(`${baseUrl}/api/canteen`).then((r) => r.json());

  const now = new Date();

  const beijingMinutes = (now.getUTCHours() + 8) * 60 + now.getUTCMinutes();

  const open = data.canteens
    .map((c: any) => {
      const currentTimeSlot = c.times.find((t: any) => {
        const [sh, sm] = t.start.split(":").map(Number);
        const [eh, em] = t.end.split(":").map(Number);

        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        return beijingMinutes >= start && beijingMinutes <= end;
      });

      if (!currentTimeSlot) return null;

      const [eh, em] = currentTimeSlot.end.split(":").map(Number);
      const endMinutes = eh * 60 + em;

      const remaining = Math.max(0, (endMinutes - beijingMinutes) * 60 * 1000);

      return {
        ...c,
        remaining,
      };
    })
    .filter(Boolean);

  if (!open.length) {
    return new Response("坏了，现在没有吃的了", { status: 404 });
  }

  return NextResponse.json(open);
}
```

由于我们最终可能要部署到 Vercel 或者类似的服务器，服务器发起请求时时间的运算时 UTC 时间，而我们在中国，因此需要手动转换成北京时间，否则我们在计算当前是否有食堂开门的时候就会有一些些问题

最终我们就得到了以下的 API：

## API

`/api/canteen`

**Method:GET** 获取所有食堂的JSON数据

`/api/canteen/:canteenName`

**Method:GET** 获取指定食堂的JSON数据

`/api/canteen/open-now`

**Method:GET** 获取目前能吃的食堂的数据

`/api/kaifan`

**Method:GET** 获取所有食堂目前的开饭状态

## 与你的 bot 集成

这个玩意儿可以轻松缝合到你的 next 项目中，搭建一个属于你的提醒吃饭 bot!

只需要注意把当前的系统时间和获取到的数据一起写入llm的prompt里就可以了！

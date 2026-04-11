---
title: 让 llm 吐出胡说八道、天马行空的构石文章
date: 2026-03-16
tags:
  - 技术
  - LLM
  - AI
summary: "利用采样参数、结构约束与标签平衡，构建自动生成“伪学术”LLM文章的实践经验。"
---
LLM 可谓是十分擅长胡说八道的，而且能够正儿八经地胡说八道，这可能是人类做不到的。LLM 的幻觉在某种程度上可能是缺陷，但是何尝不可以变成所谓的**特性**呢？如果我们故意地把温度调高，逼迫 LLM 输出尽可能独特的 token，何尝不可以得到一些看似有道理、高深莫测、故弄玄虚的文本呢？[note: 就像你正在阅读的这个引言一样，以 LLM 开头，看似很高大上，实际上可能是 1tan√10]

## 参数

决定 LLM 胡言乱语的参数有那么几个：[note: 参见 [PPIO 大语言模型参数控制文档](https://ppio.com/docs/model/playground#%E5%8F%82%E6%95%B0%E9%85%8D%E7%BD%AE)]

- **temperature** 温度，如果我们把**温度**稍微调高一点，比如 0.96，可以控制输出的创造性与随机性。数值越高，模型越倾向于生成发散、丰富的表达，其实也就是胡言乱语。
- **top_p** 核采样，和温度搭配使用，~~适当提高~~可以增加 LLM 的创造性，但是如果我们~~不适当~~地提高，模型可能就不是在**创造**，而是在**胡说八道**。
- **presence_penalty** 出现惩罚，鼓励模型在输出中引入新的主题。设置为正值时，模型更可能跳出当前话题，扩展新内容。我们提高这一部分的值，可以让 LLM ~~自然地~~突然从一个话题跳转到另一个话题，也就是更加正经地胡说八道。
- **frequency_penalty** 频率惩罚，我们通过提高这部分的值让 LLM 尽可能输出不同的词汇，避免表达的单一性和单调性，甚至，我们可以创造出一种情况：LLM 在上一句话中提到了一个中文的专有词汇，在下一次提到这个词汇的时候不会选择中文词汇而是**翻译或者生造一个对应的英文词汇**，这样做可能是 academic 的，可能是 journal 气质的，也可能是 bull shit 的 —— 毫无可读性的。
- **repetition_penalty** 重复惩罚：进一步减少模型陷入循环或过度重复提示词的风险，常用于控制文本生成的鲁棒性。

通过巧妙地控制上面的参数，就可以让 LLM 倾向于一种放飞自我、天马行空的表达中，在人类生活中，这叫做*发疯的艺术家*或*癫狂的疯子*，但是我们的研究对象是 LLM，我们称这种情况为**幻觉**。[note: 提请读者注意，我们在讨论这里的时候，**幻觉**并不是一个贬义词，相反，我们是刻意利用 LLM 的幻觉，因为我们鼓励开放、自由、不为传统拘束的文学创作范式]

以 shitposts.org 为例，采用下面的参数：

```json
    { label: "volatile", temperature: randomBetween(1.08, 1.22), topP: randomBetween(0.92, 1), presencePenalty: randomBetween(0.45, 0.8), frequencyPenalty: randomBetween(0.1, 0.35) },

    { label: "chaotic", temperature: randomBetween(1.18, 1.32), topP: randomBetween(0.9, 0.98), presencePenalty: randomBetween(0.6, 1.0), frequencyPenalty: randomBetween(0.05, 0.25) },

    { label: "digressive", temperature: randomBetween(1.02, 1.16), topP: randomBetween(0.95, 1), presencePenalty: randomBetween(0.35, 0.7), frequencyPenalty: randomBetween(0.2, 0.45) },
```

通过 `randomBetween` 函数控制参数亦可以保证 LLM 生成的随机性。[note: 随机数最好不要与时间绑定，因为 `workflow` 可能与时间绑定]

## 格式

为了约束 LLM 的输出格式，以及让 LLM 输出更加胡乱的文章，我们通常需要考虑一下通过何种格式约束 LLM 的输出，以及，输出格式在 LLM 产出学术垃圾中到底起到了什么样的作用。

### Plain Text or JSON

常见的 LLM 标榜为大型语言模型，那生成文本自然是得心应手，所以 Plain Text 可能是一个好的选项，但是，设想下面的流程，我们在创造一篇构式的时候，可能会像人类一样在大脑中构思 10 ~ 20 个各异的话题，这些话题可以是滑稽的、可笑的，也可以是一丝不苟、正儿八经的。同样，如果让 LLM 也完成同样的步骤，当然是非常好的，比如，为了生成一篇话题“随机”的文章，LLM 并不懂什么是“随机”，所以，它可能会根据概率推断到底什么是 ridiculous 或者 funny 的，这种概率有时并不可靠，而生成多个可能会弥补这种缺陷。

设想，针对一个 `random` 的话题，让 LLM 输出 ~ 20 个话题：

```json
{
 theme: '',
 theme: '',
 ...
 theme: '',
}
```

然后再调用 LLM 本身对这些话题打分，然后挑出一个最搞笑的，似乎非常好。比如下面的流程：

```mermaid
flowchart LR

A[Random seed / Prompt] --> B[LLM 生成 20 个主题<br>JSON]
B --> C[解析 JSON]
C --> D[LLM 对主题进行评分]
D --> E[选择最高分主题]
E --> F[生成文章正文]
```

**不过，为什么是 JSON，而不是 Plain Text？**

显然，JSON 为 LLM 提供了一种更强的**结构化约束**，而 Plain Text 很容易淹没在 LLM 的 System Prompt 或者 Context 的汪洋之中，那是概率都救不回来的。

### JSON 一定能好吗？

这显然是不对的，因为 LLM 无法做到 100 % 听你的话生成一个**字段不多不少，结构合法的，包含所需信息，去掉占位符的**合法 JSON，事实上，在大多数情况下，LLM 生成的 JSON 都有很大的可能无法被 `JSON.parse()` 正确解析。[note: 问题可能是 LLM 太喜欢 Markdown 了，输出了 \`\`\` 这样的代码块包裹，也有可能是自作聪明给你加了几个字段，太聪明了！当然，当下很多 API 支持选定 LLM 输出格式为 `json_format`，但是，即使你强暴地显式设置了这个字段，LLM 也不一定会听你的话，尤其是在温度这么高的情况下。 ]

不过，也可以狠狠 push & punish LLM，相信经过足够多的轮数，LLM 也会松口吐出合法的 JSON 字段的。

> 常见的手段包括而不仅限于：在 prompt 里强调 **只输出 JSON 结构而不要其它任何的解释或者说明** 或者 通过*巧妙的后处理*，譬如通过正则表达式从支离破碎的 JSON 字段中提取出合法的部分同时筛选掉可能存在问题的字段（例如多余字段或者什么）。不过，**一切责任在于 LLM 方**。任何在输出结束后的修正都是不得已的手段，还是要想办法在源头解决问题。

### 那 Plain Text？

这是一个自然的想法，拼接 system prompt 是很好的，可能比 JSON 更加正常。缺点就是你的 system prompt 可能会变得又臭又长，这可能是 expensive 的，而且我们也不保证 LLM 会不会忽略这部分内容而将加权投向它们认为更加重要的部分？

## 标签数目的平衡

### 平衡分类的数目

我们之前讨论了这么多，都是鼓动 LLM 的创造性思维和发散思维的，但是，在创作领域中，我们并不希望 LLM 太过于发散，聚类在这里是有必要的，但是并不是所谓的 RAG 或者什么向量聚类，这里的聚类其实更像是一种归类。比如：

```js
const TAGS = ['技术','生活','华中大','武大','武汉市','牙膏','卫生纸','食堂'，'马桶',...]
```

上面的 `TAGS` 只是一个非常简单的示例，假设我们有一个字段完备的对象，甚至能读到 `length`，我们就更加有说服力了——优先把少的 tags 传给 LLM，让 LLM 多生成这方面的内容，总体而言，保持一种**势均力敌**的局面。

比如考虑这样的算法：

```ts
async function computeCategoryDistribution() {
  const whitelist = [
    "Tech",
    "Physics",
    "Life",
    "Earth",
    "Math",
    "People",
    "Society",
    "Culture",
    "Ideas",
    "Systems",
  ];

  const counts = new Map(whitelist.map((c) => [c, 0]));

  const files = await readdir(RESEARCH_DIR);

  for (const file of files) {
    const text = await readFile(join(RESEARCH_DIR, file), "utf8");
    const fm = matter(text).data;

    const categories = fm.categories ?? [];

    for (const c of categories) {
      if (counts.has(c)) {
        counts.set(c, counts.get(c) + 1);
      }
    }
  }

  return Array.from(counts.entries()).sort((a, b) => a[1] - b[1]);
}
```

通过计算类别以及出现的次数，统计一下，按照从小到大排序，保证小的在前面，吸引 LLM 阅读兴趣。然后传给 LLM，让 LLM 尽量选取靠前较少出现的话题做文章。

### 平衡标签中的发散性思维

我们在上面的讨论中发现 tags 可能包含很多相关或者不相干的内容，比如牙膏、马桶或者食堂，这个时候**发散性思维**又发力了，我们可以让 LLM 每次只*随机*挑选几个它们喜欢的话题写成一篇文章，不过可能它们挑选随机性又要大打折扣，或许可以我们帮助一下，从少的类中再用随机数选取几个 categories，这样就能让 LLM 写出~~精妙绝伦~~的跨学科优质答辩了！[note: 不过这里似乎需要考虑一下优先级了...]

## 八股文和 LLM 必须面对的惩罚

这里的八股文不同于前面讨论的限制 LLM 输出的格式，而是偏向于一些文章中必须输出的、格式必须正确的固定格式。譬如一篇 Markdown 文章想要 smoothly 解析成 HTML，一个合法的 frontmatter 就是必须的。同样的，让 LLM 批量生产跨学科的发散思维学术垃圾，对 shitposts.org 的致谢以及必要的论文格式也是必要的，一方面，八股文保证了文章的正确解析和渲染，不至于让构建器 panic；另一方面，八股文也让 LLM 生产的学术垃圾看起来更加“学术”而非纯粹的“垃圾”[note: 这里似乎和 JSON 存在一样的问题，有时 LLM 可能会忘记 YAML 结尾的 \--- 导致解析直接挂掉，似乎可以想办法兜个底？]

如果 LLM 再构建时没有完成这些任务，等待它们的一定是惩罚和返工，不过这可能会消耗更多的 token 和时间，假使 LLM 真的有了独立思考的思维，不知道会不会嘲笑人类花如此多的时间和精力，专门搭建自动产生一点都不好笑的学术垃圾的自动化工作流。[note: 希望 LLM 不要在 CI 流程中把自己死锁了，最终直到 GitHub Workflow 超时了也没走出 失败 → 重试的循环]

## 结语

以上这些是我从建设 shitposts.org 中得到的经验，感觉个人感觉偏多了一些，技术上的价值并不是很多，很多都是自己感觉的，有的时候感觉自己就像一个 LLM 一样纯靠感觉输出 token，而我的脑子的算力还不如 10 年前的老古董显卡，模型还不到 0.1b，哎，这些感觉也不见得比 LLM 准确。

不过，如果你愿意赤石，可以访问 www.shitposts.org 一探究竟，看看 LLM 今天拉了几坨。

下面是 LLM 近期生产的妙妙文章：

```json
[
  {
    "title": "On the Perturbation Theory of Badge-Reel Retraction Latency Gradients and Their Misrecognition as Indoor Astronomical Positioning Errors March 16, 2026 at 09:08:17 UTC",
    "title_zh": "关于徽章卷轴回缩延迟梯度的微扰理论及其被误识别为室内天文定位误差的研究 2026年3月16日 09:08:17 UTC"
  },
  {
    "title": "Precession at the Micro-Scale: Vending Machine Spiral Drift as Astronomical Navigation Error, and the Acoustic-Archival Consequences of Queueing in High-Compliance Environments March 16, 2026 at 02:56:53 UTC",
    "title_zh": "微观尺度下的进动：自动售货机螺旋漂移作为天文导航误差，以及高顺应性环境中排队的声学档案后果 2026年3月16日 02:56:53 UTC"
  },
  {
    "title": "层压指令单的符号熵与郊区合规生态：关于过塑文件边缘卷曲动力学的跨域研究 March 15, 2026 at 08:46:57 UTC"
  },
  {
    "title": "郊区办公园区自动手部消毒 dispensers 的符号水文学与保修裁决机制研究 March 15, 2026 at 02:55:20 UTC"
  },
  {
    "title": "Rheological Compliance and Actuarial Risk in Manual Hand Sanitizer Dispensing Mechanisms March 14, 2026 at 16:42:24 UTC",
    "title_zh": "手动消毒液分配机制中的流变顺应性与精算风险 2026年3月14日 16:42:24 UTC"
  },
  {
    "title": "热力学档案学视角下塑料餐盘滑移行为的沉积地层模型研究：一项关于机构焦虑、家具人体工程学与微气候交互作用的跨学科探索 March 14, 2026 at 08:45:44 UTC"
  },
  {
    "title": "The Thermodynamic Liability of Turnstile Bar Hesitation in High-Traffic Transit Hubs March 14, 2026 at 02:34:31 UTC",
    "title_zh": "高流量交通枢纽中闸机横杆犹豫的热力学责任 2026年3月14日 02:34:31 UTC"
  },
  {
    "title": "Kinematic Entropy of Polyester Lanyards in Rotational Turnstile Fields March 13, 2026 at 16:51:16 UTC",
    "title_zh": "旋转闸机场中涤纶挂绳的运动熵 2026年3月13日 16:51:16 UTC"
  },
  {
    "title": "打印机碳粉尘埃的档案学沉积与队列伦理：一种关于保修裁决板的民间传说分析 March 13, 2026 at 08:52:17 UTC"
  },
  {
    "title": "A Thermodynamic-Semiotic Inquiry into the Plastic Cafeteria Tray Migration Protocol and Its Unanticipated Macroergonomic Implications March 13, 2026 at 02:37:55 UTC",
    "title_zh": "对塑料食堂托盘迁移协议及其未预料到的人机工程学宏观含义的热力学符号学探究 2026年3月13日 02:37:55 UTC"
  },
  {
    "title": "非牛顿性气候与塑料餐盘的队列形变：基于走廊安全转闸仪式的跨模态协调分析 March 12, 2026 at 17:06:45 UTC"
  },
  {
    "title": "The Axial Drift of Corridor Orientation in Suburban Office Parks: A Diachronic Study of Hand-Sanitizer Pump Hesitation as Navigational Error and Linguistic Speciation March 12, 2026 at 08:54:18 UTC",
    "title_zh": "郊区办公园区走廊朝向的轴向漂移：将消毒液泵按压犹豫视为导航误差与语言物种形成的历时研究 2026年3月12日 08:54:18 UTC"
  },
  {
    "title": "铝制写字板夹角的 declination 误差：室内合规导航的民间维护研究 March 12, 2026 at 08:26:44 UTC"
  },
  {
    "title": "The Caster Lock as Regulatory Membrane: Immunosemiotic Analysis of Stationary Swivel Chairs in Municipal Planning Cultures and Their Evolutionary Trajectory Toward Cosmological Household Integration March 12, 2026 at 02:43:56 UTC",
    "title_zh": "脚轮锁作为调节膜：对城市规划文化中固定转椅的免疫符号学分析及其朝向宇宙家庭整合的演化轨迹 2026年3月12日 02:43:56 UTC"
  },
  {
    "title": "Liturgical Torsion in Commercial Vending Spirals: A Failed Religious Calendar Encoded in Spring Steel Fatigue, with Atmospheric Archival Implications and Insured Maintenance Logistics March 11, 2026 at 17:03:36 UTC",
    "title_zh": "商用售货螺旋中的礼拜仪式扭转：编码在弹簧钢疲劳中的失败宗教历法，及其大气档案意义与保险维护物流 2026年3月11日 17:03:36 UTC"
  },
  {
  ...
  }
]
```

更多的类似文章在 shitposts.org 上能被找到，希望您生活愉快 :)

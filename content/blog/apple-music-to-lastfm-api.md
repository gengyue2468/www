---
title: 把 Apple Music Scrobble 到 Last.fm
date: 2026-09-19
tags:
  - 技术
  - API
  - LastFM
  - AppleMusic
summary: 通过 Scrobbler 将 Apple Music 的播放记录同步到 Last.fm，再利用 Last.fm API 获取最近播放与 Now Playing 状态，并通过简单的 middleware 整理数据，用于博客中的音乐播放展示。
comment: true
---
[Apple Music](https://music.apple.com/) 确实[提供官方的 API](https://developer.apple.com/documentation/applemusicapi)，不过这需要加入 Apple Developer Program，意味着每年需要交 99 USD 的费用。对于一些简单的需求，例如获取正在播放状态、最近播放列表而言是不划算的。

因此，可以尝试另辟蹊径。利用 Scrobble [^ **Scrobbling** is the process of recording what a user listens to and sending that listening data to Last.fm. source: https://en.wikipedia.org/wiki/Last.fm]（中文这里可以理解为“收听记录同步”或“收听记录上报”） 可以将 Apple Music 的音乐播放信息 Scrobble 到 Last.fm 的数据库，进而通过 Last.fm 的 API 使用。

利用 Last.fm 的 API，简单概括为以下几步：
1. 前往 last.fm 注册一个账号
2. 注册并验证账户后，前往 https://www.last.fm/api/account/create 创建一个新的 API account，其中 `name` `description` `callbackURL` 按需随意填写即可。完成后保存生成的 api key。
3. 完整的信息示例如下：
```plaintext
API account created
Here are the details of your new API account.

Application name	lastplayed
API key	xxxxxx   <- Will be used later
Shared secret	yyyyyy
Registered to	gengyue
```

Last.fm 的 API `baseUrl` 是 https://ws.audioscrobbler.com/2.0/ ，一个最简单的请求类似：`GET https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=gengyue&api_key=xxxxxx&limit=1&format=json`[^ 替换这里 params 的 `user` `api_key` 为自己的，可调整 `page` `limit` 参数。最高支持 200 项。] 

这个接口会返回一个 JSON，`Interface` 类似：

```typescript
interface LastFmTrack {
  artist: { "#text": string };
  image: Array<{ size: string; "#text": string }>;
  album: { "#text": string };
  name: string;
  url: string;
  "@attr"?: { nowplaying?: string };
  date?: { uts: string; "#text": string };
}
```

为了简化，推荐自行搭建一个 middleware [^ 任何流行的后端框架都可以，例如我使用 [Hono](https://hono.dev/)]来获取并处理数据，将原来膨大的数组扁平化，可以做到返回结构类似：

```json
[
  {
    "artist": "Andrew Lloyd Webber & \"Cats\" 1981 Original London Cast",
    "image": "https://lastfm-img.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png",
    "album": "Highlights from Cats (Original London Cast Recording)",
    "name": "Prologue: Jellicle Songs For Jellicle Cats",
    "url": "https://www.last.fm/music/Andrew+Lloyd+Webber+&+%22Cats%22+1981+Original+London+Cast/_/Prologue:+Jellicle+Songs+For+Jellicle+Cats",
    "nowplaying": true,
    "playedAt": null
  },
  {
    "artist": "Andrew Lioyd Webber & Carrie Hope Fletcher",
    "image": "https://lastfm-img.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png",
    "album": "Highlights From Andrew Lloyd Webber’s “Cinderella”",
    "name": "I Know I Have A Heart (From Andrew Lloyd Webber’s “Cinderella”)",
    "url": "https://www.last.fm/music/Andrew+Lioyd+Webber+&+Carrie+Hope+Fletcher/_/I+Know+I+Have+A+Heart+(From+Andrew+Lloyd+Webber%E2%80%99s+%E2%80%9CCinderella%E2%80%9D)",
    "nowplaying": false,
    "playedAt": 1789829662
  }
]
```

**至此，数据处理有了！那么，数据从哪里来呢？**

:::fullwidth

```mermaid
flowchart LR
    A[Apple Music] -->|Playback info| B[Scrobbler]
    B -->|Scrobble| C[Last.fm]
    C -->|user.getRecentTracks| D[Last.fm API]
    D --> E[Middleware]
    E -->|Flatten / Transform| F[Now Playing Card]
```

:::

我们之前提到，本质上 Last.fm 作为收听记录数据库，自然需要我们从本地 "Scrobble" 即上报收听记录到 Last.fm [^ 详见上方的 Mermaid 流程图]，这个过程中就需要一些 Scrobbler 软件辅助。我在这里使用的是 [Pano Scrobbler](https://github.com/kawaiiDango/pano-scrobbler)，多端支持，支持同步到多个 Scrobbling 服务。当然，也可以随便选择合适的 Scrobbler，基本流程如下：
1. 下载并在 Scrobbler 上认证 Last.fm 
2. 打开 Apple Music 并播放音乐，在 Scrobbler 中选择来源 AM
3. 请求 Last.fm API，看看是否工作正常。

All done，It works!

**局限与不足**本质上这是一种权宜之计，由于 Last.fm 的 API 并不支持 WebSocket，因此只能牺牲一部分实时性（例如使用简单轮询代替长连接）。Scrobbler 的不稳定行为和神秘 Bug 也是另一方面，由于某些行为，`Now Playing` 的状态更新并不及时，不过对于大多数场景，想必已经足够。同时，这个过程中依赖本地 Scrobbler 可能会白白增加无用的功耗，这也是一个可能需要权衡的问题。

我根据上述思路制作了[首页的 Now Playing 卡片](/)，至少它工作了。我自认为这个很酷，如果您也感兴趣的话，或许可以试试看。下面是一个 demo：

<now-playing-card></now-playing-card>

---

**结束了吗？** 并没有

想必聪明的读者已经发现了，从 Apple Music 到 Last.fm 的 Scrobble 过程中，我们能够稳定依赖的主要还是歌曲名、歌手和专辑等文本元数据，而专辑封面则依赖 Last.fm 自己的匹配机制。Last.fm 的封面匹配并不总是可靠：它可能匹配到错误的封面，也可能完全匹配不到，最终 fallback 到默认封面。对于追求效果的我们而言肯定是 Unacceptable [^ 不可接受的，译者注]。

幸运的是，苹果留下了一个 iTunes 搜索接口，不需要 API Key 鉴权。可以使用类似下方的方式调用：

```typescript
const data = await httpClient<ITunesSearchResponse>({
            method: "GET",
            url: "https://itunes.apple.com/search",
            params: {
              term,
              country,
              media: "music",
              entity: "song",
              limit: 25,
            },
          });
```

Bingo，既然这些歌曲原本就来自 Apple Music，利用 Apple 自己的 iTunes Search 接口回查 metadata，通常能够拿到更准确的 Album Cover。我在前文中提到，推荐构造一个 Middleware 来处理数据，在这里又一次印证了这个想法。这个中间件可以完成：
- Last.fm 原始数据的清洗
- iTunes 封面的补全与 Last.fm 元数据修正
- 缓存构建 [^ 我认为这是很重要的一环，对于限流十分重要，同时能够减轻对中间件的压力。]

当然，实际操作过程中可能会遇到一些问题。请注意上文请求中的 `country` 这个 parameter，如果不传默认返回 `US` 区的结果。而一些歌曲或专辑在不同地区的 `catalog` 中存在差异，例如 `CN` `HK` `SG`。这个参数实际上决定了查询的 `storefront`。

> 结论是这里的搜索接口仍然不能作为**精确搜索**来看待，而仍应该作为**模糊搜索**接口看待。推测原因有：1. Scrobble 过程中 Album Artist 等参数可能已经取错 2. Apple 接口设计如此。不管怎么样，不建议设置十分严苛的搜索参数。

最终我们可以得到一个层层 fallback 的架构：
1. Cover 的来源
:::fullwidth

```mermaid
flowchart LR
    A[iTunes API] --> B[Last.fm API] --> C[Default Fallback]
```
:::

当然，这里强调的是*优先级*而非*数据流*。[^ 即优先尝试使用 iTunes Search 获取封面；匹配失败时使用 Last.fm 提供的封面，仍不可用时才使用默认封面。]

2. `country` 这个 parameter 的选择，层层 fallback
:::fullwidth
```mermaid
flowchart LR
    CN[CN] --> HK[HK] --> SG[SG] --> JP[JP] --> US["US (Default)"]
```
:::

好哦，至此感觉流程已经比较完整，效果不戳。
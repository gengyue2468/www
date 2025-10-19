import { calculateReadingTime } from "@/lib/CalculateReadingTime";
import Header from "@/components/layouts/Header";
import Layout from "@/components/layouts/Layout";
import Wrapper from "@/components/layouts/Wrapper";
import MdxContent from "@/components/layouts/MdxContent";
import { serialize } from "next-mdx-remote/serialize";
import { remarkPlugins, rehypePlugins } from "@/lib/markdown/plugins";

const designMarkdown = `

![Stewie Griffin](/static/stewie-griffin.webp)

# 字体

使用 [Google Fonts](https://fonts.google.com/) 缓存

- Mona Sans
- Noto Sans SC

# 标题

标题采用统一大小，字重为600

# 示例标题

# 文字

Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

**加粗文本**

*斜体文本*

>引用文本

~~世界是平坦的。~~ 我们现在知道世界是圆的。(删除线测试)

# 列表

- Item 1
- Item 2
- Item 3

1. Item 1
2. Item 2
3. Item 3

# 图片

![等待是长跑，不是短跑 —— 威尔・史密斯。](https://uapis.cn/api/bing.php)

# 视频

<Video src="/sample-5s.mp4" alt="测试视频 5s" />

# 代码

\`\`\`bash
npx create-next-app@latest my-project
\`\`\`

\`\`\`js
export default function Home{
   return(
   <div> Hello </div>
   )
}
\`\`\`

> 测试持续中...

# 表格

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

# 任务列表

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

# 脚注

这是一个带有脚注的句子[^1]。

[^1]: 这是脚注的内容。

# 数学公式

勾股定理: $a^2 + b^2 = c^2$

欧拉公式: $e^{i \\pi} + 1 = 0$

二次方程求根公式:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

积分公式:
$$
\\int_a^b f(x) dx = F(b) - F(a)
$$

矩阵示例:
$$
\\begin{bmatrix}
1 & 2 & 3 \\\\
4 & 5 & 6 \\\\
7 & 8 & 9
\\end{bmatrix}
$$

绝对值函数:
$$
f(x) = 
\\begin{cases} 
x & \\text{if } x \\geq 0 \\\\
-x & \\text{if } x < 0 
\\end{cases}
$$

# 表情符号测试

## 常用表情

:+1: :sparkles: :tada: :rocket: :metal: :octocat: 

## 分类表情

### 笑脸和情感
:smile: :laughing: :blush: :smiley: :relaxed: :smirk: :heart_eyes: :kissing_heart: :kissing: :flushed: :relieved: :satisfied: :grin: :wink: :stuck_out_tongue_winking_eye: :stuck_out_tongue_closed_eyes: :grinning: :kissing_smiling_eyes: :kissing_closed_eyes: 

### 手势
:thumbsup: :thumbsdown: :ok_hand: :punch: :fist: :v: :wave: :hand: :raised_hand: :open_hands: :point_up: :point_down: :point_left: :point_right: :raised_hands: :pray: :clap: :muscle: 

### 动物和自然
:dog: :cat: :mouse: :hamster: :rabbit: :wolf: :frog: :tiger: :koala: :bear: :pig: :cow: :boar: :monkey_face: :monkey: :horse: :racehorse: :camel: :sheep: :elephant: :panda_face: :snake: :bird: :baby_chick: :hatched_chick: :hatching_chick: :chicken: :penguin: :turtle: :bug: :honeybee: :ant: :beetle: :snail: :octopus: :tropical_fish: :fish: :whale: :whale2: :dolphin: :cow2: :ram: :rat: :water_buffalo: :tiger2: :rabbit2: :dragon: :goat: :rooster: :dog2: :pig2: :mouse2: :ox: :dragon_face: :blowfish: :crocodile: :dromedary_camel: :leopard: :cat2: :poodle: :paw_prints: 

### 食物和饮料
:green_apple: :apple: :pear: :tangerine: :lemon: :banana: :watermelon: :grapes: :strawberry: :melon: :cherries: :peach: :pineapple: :tomato: :eggplant: :hot_pepper: :corn: :sweet_potato: :honey_pot: :bread: :cheese: :poultry_leg: :meat_on_bone: :fried_shrimp: :egg: :hamburger: :fries: :hotdog: :pizza: :spaghetti: :taco: :burrito: :ramen: :stew: :fish_cake: :sushi: :bento: :curry: :rice_ball: :rice: :rice_cracker: :oden: :dango: :shaved_ice: :ice_cream: :icecream: :cake: :birthday: :custard: :candy: :lollipop: :chocolate_bar: :popcorn: :doughnut: :cookie: :beer: :beers: :wine_glass: :cocktail: :tropical_drink: :champagne: :sake: :tea: :coffee: :baby_bottle: 

### 旅行和地点
:airplane: :rocket: :steam_locomotive: :bullettrain_side: :bullettrain_front: :train2: :metro: :light_rail: :station: :tram: :bus: :oncoming_bus: :blue_car: :oncoming_automobile: :car: :taxi: :oncoming_taxi: :articulated_lorry: :busstop: :rotating_light: :police_car: :oncoming_police_car: :fire_engine: :ambulance: :minibus: :truck: :train: :mountain_railway: :suspension_railway: :mountain_cableway: :aerial_tramway: :ship: :rowboat: :speedboat: :traffic_light: :vertical_traffic_light: :construction: :fuelpump: :busstop: :map: :moyai: :statue_of_liberty: :fountain: :tokyo_tower: :european_castle: :japanese_castle: :stadium: :ferris_wheel: :roller_coaster: :carousel_horse: :building_construction: :house: :house_with_garden: :office: :post_office: :european_post_office: :hospital: :bank: :hotel: :love_hotel: :convenience_store: :school: :department_store: :factory: :japanese_castle: :european_castle: :wedding: :tokyo_tower: 

`;

const desc = "有关这个网站的设计语言与规范";

export default function Design({ mdxSource, readingTime }) {
  return (
    <Layout title="设计" desc={desc}>
      {/*  <Header
        title="设计"
        date="2025-08-06"
        readingTime={readingTime}
        desc={desc}
      />

      <Wrapper>
        <MdxContent mdxSource={mdxSource} />
      </Wrapper> */}

      <div className="flex flex-col items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-36 my-16"
          viewBox="0 0 128 128"
        >
          <path fill="#fcc21b" d="M104.22 128h13.61L99.9 68.55H86.29z" />
          <path
            fill="#fcc21b"
            d="M85.28 128H71.46l16.12-59.45h13.83zm-42.05 0h13.6L38.9 68.55H25.3z"
          />
          <path fill="#fcc21b" d="M24.29 128H10.46l16.12-59.45h13.83z" />
          <defs>
            <path
              id="IconifyId199f79c0405c057186"
              d="M124.54 73.09H3.45a3.27 3.27 0 0 1-3.26-3.27V26.03c0-1.8 1.46-3.27 3.26-3.27h121.09c1.81 0 3.27 1.46 3.27 3.27v43.79c0 1.8-1.46 3.27-3.27 3.27"
            />
          </defs>
          <use fill="#fcc21b" href="#IconifyId199f79c0405c057186" />
          <clipPath id="IconifyId199f79c0405c057187">
            <use href="#IconifyId199f79c0405c057186" />
          </clipPath>
          <g fill="#2f2f2f" clip-path="url(#IconifyId199f79c0405c057187)">
            <path d="m-6.03 85.67l-10.58-7.96L39.52-.86L50.1 7.1zm33.45 0l-10.58-7.96L72.97-.86L83.56 7.1zm33.45 0l-10.58-7.96L106.42-.86L117 7.1zm33.44 0l-10.57-7.96L139.88-.86l10.58 7.96z" />
          </g>
          <g fill="#2f2f2f">
            <path d="M31.65 13.66c0 5.43-4.4 9.83-9.83 9.83c-5.42 0-9.82-4.4-9.82-9.83s4.4-9.82 9.82-9.82c5.43 0 9.83 4.4 9.83 9.82" />
            <path d="M21.82 25.81c-6.69 0-12.13-5.45-12.13-12.15c0-6.69 5.44-12.14 12.13-12.14c6.7 0 12.15 5.44 12.15 12.14s-5.45 12.15-12.15 12.15m0-19.65c-4.13 0-7.5 3.37-7.5 7.51s3.36 7.51 7.5 7.51c4.15 0 7.51-3.37 7.51-7.51s-3.37-7.51-7.51-7.51" />
          </g>
          <g fill="#2f2f2f">
            <path d="M18.59 3.84h3.22v19.65h-3.22z" />
            <path d="M21.82 25.85H18.6c-1.3 0-2.36-1.05-2.36-2.35V3.84c0-1.3 1.06-2.35 2.36-2.35h3.22c1.31 0 2.36 1.06 2.36 2.35v19.65c0 1.31-1.06 2.36-2.36 2.36" />
          </g>
          <path
            fill="#ed6c30"
            d="M28.58 13.66c0 5.43-4.41 9.83-9.83 9.83c-5.43 0-9.83-4.4-9.83-9.83s4.39-9.82 9.83-9.82c5.43 0 9.83 4.4 9.83 9.82"
          />
          <path
            fill="#2f2f2f"
            d="M18.76 25.81c-6.7 0-12.14-5.45-12.14-12.15c0-6.69 5.45-12.14 12.14-12.14c6.7 0 12.15 5.44 12.15 12.14c-.01 6.7-5.46 12.15-12.15 12.15m0-19.65c-4.14 0-7.51 3.37-7.51 7.51s3.37 7.51 7.51 7.51c4.13 0 7.51-3.37 7.51-7.51s-3.38-7.51-7.51-7.51"
          />
          <g fill="#2f2f2f">
            <circle cx="110.8" cy="13.67" r="9.83" />
            <path d="M110.79 25.81c-6.7 0-12.14-5.45-12.14-12.15c0-6.69 5.44-12.14 12.14-12.14s12.14 5.44 12.14 12.14c.01 6.7-5.44 12.15-12.14 12.15m0-19.65c-4.14 0-7.51 3.37-7.51 7.51s3.37 7.51 7.51 7.51s7.51-3.37 7.51-7.51s-3.37-7.51-7.51-7.51" />
          </g>
          <g fill="#2f2f2f">
            <path d="M107.57 3.84h3.23v19.65h-3.23z" />
            <path d="M110.79 25.85h-3.23c-1.3 0-2.35-1.05-2.35-2.35V3.84c0-1.3 1.05-2.35 2.35-2.35h3.23c1.3 0 2.35 1.06 2.35 2.35v19.65a2.337 2.337 0 0 1-2.35 2.36" />
          </g>
          <circle cx="107.73" cy="13.67" r="9.83" fill="#ed6c30" />
          <path
            fill="#2f2f2f"
            d="M107.73 25.81c-6.7 0-12.14-5.45-12.14-12.15c0-6.69 5.45-12.14 12.14-12.14c6.7 0 12.15 5.44 12.15 12.14c-.01 6.7-5.45 12.15-12.15 12.15m0-19.65c-4.14 0-7.51 3.37-7.51 7.51s3.37 7.51 7.51 7.51s7.51-3.37 7.51-7.51c-.01-4.14-3.37-7.51-7.51-7.51"
          />
        </svg>

        <h1 className="font-extrabold text-4xl mb-4">当前无法使用此页面</h1>
        <p className="font-bold text-xl opacity-50">此页面正在进行重构，我们马上回来</p>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  // 使用插件配置序列化 MDX 内容
  const mdxSource = await serialize(designMarkdown, {
    mdxOptions: {
      remarkPlugins,
      rehypePlugins,
    },
  });

  const readingTime = calculateReadingTime(designMarkdown);
  return { props: { mdxSource, readingTime } };
}

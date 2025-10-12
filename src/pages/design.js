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
      <Header
        title="设计"
        date="2025-08-06"
        readingTime={readingTime}
        desc={desc}
      />

      <Wrapper>
        <MdxContent mdxSource={mdxSource} />
      </Wrapper>

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

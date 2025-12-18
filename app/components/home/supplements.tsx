import { Link } from "react-router";

export default function Supplements() {
  return (
    <section className="mt-8 space-y-4">
      <h3 className="font-semibold">那么，我最近有在忙什么吗？</h3>
      <p>
        现代人容易陷入无意义的忙碌中，我就不一样了，我不是吃就是睡，偶尔敲几下代码。剩下的...Cursor
        宝宝，来帮我完成！"什么？！不要乱动我的代码！都说了用中文回答我！"
      </p>
      <p>
        当然，如果你需要留学申请文书写作辅助工具的话，我们正在开发一款小工具——{" "}
        <Link to="https://buddyup.top">BuddyUp</Link>. 使用 AI
        驱动，帮你轻松写出独属于你的最佳个人陈述！
      </p>
      <p>
        自从冲动开了个网易云音乐学生 VIP 会员后，整天都在听歌，听的主要是 90 -
        10 年代的歌，不能说我审美的倒退吧，我怎么感觉是进步呢...
      </p>
    </section>
  );
}

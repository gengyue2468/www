import { Link } from "react-router";

export default function OpenSource() {
  return (
    <section className="mt-8 space-y-4">
      <p>
        你可以在
        <Link to="https://github.com/gengyue2468/HUST-Chifan">GitHub</Link>
        上找到这个小玩具的完整代码。或者，你可以
        <Link to="/blog/hust-chifan" prefetch="intent">
          阅读我写的这篇文章
        </Link>
        来了解更多有关这个小玩具的神奇信息！
      </p>
    </section>
  );
}

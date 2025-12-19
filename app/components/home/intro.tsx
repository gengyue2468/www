import { Link } from "react-router";

export default function Intro() {
  return (
    <section className="mt-4 space-y-4">
      <p>
        你好啊! 再次感谢您访问我的网站，如你所见，我现在在
        <Link to="https://hust.edu.cn">华中科技大学 (HUST)</Link>
        念计算机科学与技术专业，目前是大一的xdx.
      </p>
      <p>
        我主要进行前端开发，并且对互联网技术感兴趣。一般来说，我的技术栈包括
        React、TypeScript、 Next.js 和 Tailwind CSS。现在我是
        <Link to="https://www.bingyan.net">冰岩作坊</Link>前端组的一员。
      </p>
      <p>
        你可以随意向<Link to="mailto:ciallo@gengyue.site">我的邮箱</Link>
        投递垃圾。对了，这是<Link to="https://github.com/gengyue2468">我的GitHub</Link>。
      </p>
    </section>
  );
}

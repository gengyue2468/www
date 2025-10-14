import Layout from "@/components/layouts/Layout";
import Locker from "@/components/ui/Locker";

export default function Home() {
  const contact = [
    {
      title: "电子邮件：",
      content: "gengyue2468@outlook.com",
      href: "mailto:gengyue2468@outlook.com",
    },
    {
      title: "学校电子邮件：",
      content: process.env.NEXT_PUBLIC_HUST_EDU_EMAIL,
      href: `mailto:${process.env.NEXT_PUBLIC_HUST_EDU_EMAIL}`,
      protected: true,
      password: process.env.NEXT_PUBLIC_HUST_EMAIL_PASSWORD,
    },
    {
      title: "QQ：",
      content: "3041299667",
      href: null,
    },
    {
      title: "GitHub：",
      content: "@gengyue2468",
      href: "https://github.com/gengyue2468",
    },
  ];

  const device = [
    {
      brand: "荣耀",
      device: "GT Pro",
      cpu: "骁龙 8 至尊领先版",
      ram: "12 GB",
      rom: "256 GB",
    },
    {
      brand: "荣耀",
      device: "平板 10",
      cpu: "骁龙 7 Gen 3",
      ram: "12 GB",
      rom: "256 GB",
    },
    {
      brand: "荣耀",
      device: "手表 5",
      cpu: null,
      ram: "64 MB",
      rom: "1 GB",
    },
    {
      brand: "惠普",
      device: "暗影精灵 11",
      cpu: "酷睿 i9-14900 HX",
      ram: "32 GB",
      rom: "1 TB",
    },
    {
      brand: "Apple",
      device: "iMac 24' (2021)",
      cpu: "M1",
      ram: "16 GB",
      rom: "512 GB",
    },
    {
      brand: "联想",
      device: "B300",
      cpu: "酷睿2 E8400",
      ram: "2 GB",
      rom: "500 GB",
      outdate: true,
    },
    {
      brand: "荣耀",
      device: "V10",
      cpu: "麒麟 970",
      ram: "6 GB",
      rom: "64 GB",
      outdate: true,
    },
    {
      brand: "荣耀",
      device: "畅玩 7x",
      cpu: "麒麟 659",
      ram: "4 GB",
      rom: "64 GB",
      outdate: true,
    },
    {
      brand: "红米",
      device: "3",
      cpu: "骁龙 616",
      ram: "2 GB",
      rom: "16 GB",
      outdate: true,
    },
  ];
  return (
    <Layout title="BriGriff - I'm thinking">
      <h1 className="mt-8 mb-4">关于</h1>

      <p>
        我是<a href="https://hust.edu.cn">华中科技大学</a>{" "}
        <a href="https://cs.hust.edu.cn">计算机科学与技术学院</a>
        的一名学生，是大一的小东西。
      </p>
      <p className="mt-4">
        如果你认识我的话，那你就认识我了。如果你不认识我，那你绝对不认识我。
      </p>

      <h1 className="mt-8 mb-4">联系我</h1>
      {contact.map((item, index) => (
        <p key={index} className="mt-1">
          <span className="font-medium">{item.title}</span>
          {item.protected ? (
            <Locker
              password={item.password}
              information={<a href={item.href}>{item.content}</a>}
            />
          ) : item.href ? (
            <a href={item.href}>{item.content}</a>
          ) : (
            <span>{item.content}</span>
          )}
        </p>
      ))}

      <h1 className="mt-8 mb-4">设备</h1>

      {device.map((item, index) => (
        <div
          key={index}
          className={`mt-1 flex flex-row items-center justify-between ${
            item.outdate && "opacity-50"
          }`}
        >
          <p className="font-medium">
            {item.brand} {item.device}{" "}
            {item.outdate && (
              <span className="text-xs bg-neutral-200 dark:bg-neutral-800 rounded-sm px-1 py-0.5">
                过时
              </span>
            )}
          </p>
          <p className="opacity-50 text-xs">
            {item.cpu} {item.ram} + {item.rom}
          </p>
        </div>
      ))}

      <p className="mt-4">
        诸如魅族 MX6、MX5、MX2 及 HTC Windows Phone 等更古早产品并未加入到列表中
      </p>

      <p className="mt-1 text-xs opacity-50">* 红米 3 现在正作为电子钟运行</p>

      <h1 className="mt-8 mb-4">网站</h1>

      <p className="mt-1">页面使用 Next.js + TailwindCSS 建造</p>
      <p className="mt-1">字体使用 阿里巴巴普惠体、思源宋体和 Mono Sans</p>
      <p className="mt-1">所有样式都是手搓的</p>
      <p className="mt-2 opacity-50">
        如果你看不清楚字，请使用 Ctrl +
        滚轮缩放页面或者双指捏合屏幕以放大/缩小页面
      </p>
    </Layout>
  );
}

import { useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import axios from "axios";
import type { Canteen } from "../../types/canteen";
import { Header, Intro, Location, Posts, Supplements } from "~/components/home";
import CanteenDisplay from "~/components/home/canteen";

export async function loader({}: Route.LoaderArgs) {
  try {
    const canteenPromise = axios
      .get("https://chifan.huster.fun/api/open-now")
      .then((response) => {
        const openedCanteen: Canteen[] = Array.isArray(response.data)
          ? response.data
          : [];
        return openedCanteen;
      })
      .catch((error) => {
        console.error("Error fetching canteen status:", error);
        return [] as Canteen[];
      });
    return {
      openedCanteen: canteenPromise,
    };
  } catch (error) {
    console.error("Loader error:", error);
    return { openedCanteen: Promise.resolve([] as Canteen[]) };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Geng Yue" },
    {
      name: "description",
      content:
        "你好，我是 Geng Yue，一名来自华中科技大学的计算机科学与技术专业学生。关注前端开发和互联网技术。",
    },
    {
      name: "keywords",
      content:
        "Geng Yue, 耿越, 华中科技大学, 计算机科学与技术, 前端开发, 互联网技术, 冰岩作坊, BuddyUp",
    },
    {
      name: "author",
      content: "Geng Yue",
    },
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "og:title",
      content: "Geng Yue",
    },
    {
      name: "og:description",
      content:
        "你好，我是 Geng Yue，一名来自华中科技大学的计算机科学与技术专业学生。关注前端开发和互联网技术。",
    },
    {
      name: "og:image",
      content: "https://gengyue.site/og-image.png",
    },
    {
      name: "og:url",
      content: "https://gengyue.site",
    },
    {
      name: "og:type",
      content: "website",
    },
    {
      name: "og:locale",
      content: "zh-CN",
    },
    {
      name: "og:site_name",
      content: "Geng Yue",
    },
    {
      name: "og:locale:alternate",
      content: "en-US",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: "Geng Yue",
    },
    {
      name: "twitter:description",
      content:
        "你好，我是 Geng Yue，一名来自华中科技大学的计算机科学与技术专业学生。关注前端开发和互联网技术。",
    },
    {
      name: "twitter:image",
      content: "https://gengyue.site/og-image.png",
    },
    {
      name: "twitter:url",
      content: "https://gengyue.site",
    },
    {
      name: "twitter:site",
      content: "@gengyue2468",
    },
    {
      name: "twitter:creator",
      content: "@gengyue2468",
    },
  ];
}

export default function Home() {
  const { openedCanteen } = useLoaderData<typeof loader>();

  return (
    <>
      <Header />
      <Location />
      <Intro />
      <CanteenDisplay openedCanteen={openedCanteen} />
      <Posts />
      <Supplements />
    </>
  );
}

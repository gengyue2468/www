import { Client } from "@notionhq/client";

// 初始化Notion客户端
export const notion = new Client({
  auth: process.env.NOTION_AUTH,
});

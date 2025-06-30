import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_AUTH,
});

export default async function handler(req, res) {
  const { id } = req.query;

  try {

    const page = await notion.pages.retrieve({ page_id: id });

    const blocks = await notion.blocks.children.list({
      block_id: id,
      page_size: 100,
    });

    res.status(200).json({ page, blocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
}
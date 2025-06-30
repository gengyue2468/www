import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_AUTH,
});

export default async function handler(req, res) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Date", 
          direction: "descending",
        },
      ],
    });

    res.status(200).json(response.results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}
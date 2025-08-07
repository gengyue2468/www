import { getDatabasePages, getPageContentAsMarkdown } from '@/lib/notion/fetcher';

export default async function handler(req, res) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      return res.status(500).json({ error: "NOTION_DATABASE_ID is not configured" });
    }

    const pages = await getDatabasePages(databaseId);

    const pagesWithContent = await Promise.all(
      pages.map(async (page) => {
        const markdownContent = await getPageContentAsMarkdown(page.id);

        return {
          ...page,
          content: markdownContent, // 转换为Markdown格式的内容
        };
      })
    );

    res.status(200).json(pagesWithContent);
  } catch (error) {
    console.error('Error fetching Notion pages:', error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

import { getPageMetadata, getPageContentAsMarkdown } from '@/lib/notion/fetcher';

export const runtime = 'edge';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Page ID is required" });
  }

  try {
    // 获取页面元数据
    const page = await getPageMetadata(id);
    
    // 获取页面内容并转换为Markdown
    const markdownContent = await getPageContentAsMarkdown(id);
    
    // 提取封面和图标信息
    const cover = page.cover 
      ? (page.cover.type === "external" ? page.cover.external.url : page.cover.file.url)
      : null;
      
    const icon = page.icon 
      ? (page.icon.type === "emoji" ? page.icon.emoji : (page.icon.type === "external" ? page.icon.external.url : page.icon.file.url))
      : null;

    res.status(200).json({ 
      ...page,
      cover,
      icon,
      content: markdownContent 
    });
  } catch (error) {
    console.error('Error fetching Notion page:', error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
}
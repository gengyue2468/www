import { notion } from './client';
import { blocksToMarkdown } from '../markdown/transformer';

// 获取数据库页面列表
export async function getDatabasePages(databaseId, sorts = [{ property: "Date", direction: "descending" }]) {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts
  });
  
  return response.results;
}

// 获取单页元数据
export async function getPageMetadata(pageId) {
  return await notion.pages.retrieve({ page_id: pageId });
}

// 递归获取所有嵌套块内容
export async function getAllBlocks(blockId) {
  let allBlocks = [];
  let cursor = undefined;
  
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    
    for (const block of response.results) {
      const blockCopy = { ...block };
      
      if (blockCopy.has_children && blockCopy.type !== "child_page") {
        blockCopy.children = await getAllBlocks(blockCopy.id);
      }
      
      allBlocks.push(blockCopy);
    }
    
    cursor = response.next_cursor;
  } while (cursor);
  
  return allBlocks;
}

// 获取页面内容并转换为Markdown
export async function getPageContentAsMarkdown(pageId) {
  const contentBlocks = await getAllBlocks(pageId);
  return blocksToMarkdown(contentBlocks).join("");
}

    
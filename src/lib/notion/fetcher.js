import { notion } from "./client"
import { blocksToMarkdown } from "../markdown/transformer"

// 缓存页面内容（根据实际需求调整缓存策略）
const pageContentCache = new Map()

// 获取数据库页面列表（保持原样）
export async function getDatabasePages(
  databaseId,
  sorts = [{ property: "Date", direction: "descending" }]
) {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts
  })
  return response.results
}

// 获取单页元数据（保持原样）
export async function getPageMetadata(pageId) {
  return await notion.pages.retrieve({ page_id: pageId })
}

// 优化后的块获取 - 并行处理子块
export async function getAllBlocks(blockId) {
  let allBlocks = []
  let cursor = undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100
    })

    // 并行处理子块
    const blocksWithChildren = await Promise.all(
      response.results.map(async block => {
        // 跳过不需要递归的子页面类型
        if (block.has_children && block.type !== "child_page") {
          // 直接修改原对象，避免深度复制
          block.children = await getAllBlocks(block.id)
        }
        return block
      })
    )

    allBlocks = allBlocks.concat(blocksWithChildren)
    cursor = response.next_cursor
  } while (cursor)

  return allBlocks
}

// 优化后的Markdown获取
export async function getPageContentAsMarkdown(pageId) {
  // 检查缓存
  if (pageContentCache.has(pageId)) {
    return pageContentCache.get(pageId)
  }

  const contentBlocks = await getAllBlocks(pageId)
  const markdownContent = blocksToMarkdown(contentBlocks).join("")

  // 设置缓存（根据实际需求设置过期时间）
  pageContentCache.set(pageId, markdownContent)

  return markdownContent
}

    
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_AUTH,
});

// 递归获取所有嵌套块内容
async function getAllBlocks(blockId) {
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

// 将富文本数组转换为Markdown格式字符串
function richTextToMarkdown(richText) {
  return richText.map(rt => {
    let text = rt.text.content;
    const annotations = rt.annotations;
    const link = rt.href;

    if (annotations.code) text = `\`${text}\``;
    if (annotations.bold) text = `**${text}**`;
    if (annotations.italic) text = `*${text}*`;
    if (annotations.strikethrough) text = `~~${text}~~`;
    
    if (link) text = `[${text}](${link})`;
    
    return text;
  }).join('');
}

// 递归将Notion块转换为Markdown
function blocksToMarkdown(blocks, indentLevel = 0) {
  return blocks.map(block => {
    const indent = "  ".repeat(indentLevel);
    let markdown = "";
    
    switch (block.type) {
      case "paragraph":
        markdown = indent + richTextToMarkdown(block.paragraph.rich_text) + "\n\n";
        break;
        
      case "heading_1":
        markdown = indent + "# " + richTextToMarkdown(block.heading_1.rich_text) + "\n\n";
        break;
        
      case "heading_2":
        markdown = indent + "## " + richTextToMarkdown(block.heading_2.rich_text) + "\n\n";
        break;
        
      case "heading_3":
        markdown = indent + "### " + richTextToMarkdown(block.heading_3.rich_text) + "\n\n";
        break;
        
      case "bulleted_list_item":
        markdown = indent + "- " + richTextToMarkdown(block.bulleted_list_item.rich_text) + "\n";
        break;
        
      case "numbered_list_item":
        markdown = indent + "1. " + richTextToMarkdown(block.numbered_list_item.rich_text) + "\n";
        break;
        
      case "image": {
        const image = block.image;
        const url = image.type === "external" ? image.external.url : image.file.url;
        const caption = image.caption.length > 0 
          ? richTextToMarkdown(image.caption) 
          : "图片";
        markdown = indent + `![${caption}](${url})\n\n`;
        break;
      }

       case "video": {
        const video = block.video;
        const url = video.type === "external" ? video.external.url : video.file.url;
        const caption = video.caption.length > 0 
          ? richTextToMarkdown(video.caption) 
          : "视频";
        markdown = indent + `<video src="${url}" controls title="${caption}"></video>\n\n`;
        break;
      }
      
      case "divider":
        markdown = indent + "---\n\n";
        break;
        
      case "code":
        const language = block.code.language;
        const codeContent = richTextToMarkdown(block.code.rich_text);
        markdown = indent + `\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;
        break;
        
      case "quote":
        const quoteText = richTextToMarkdown(block.quote.rich_text);
        markdown = indent + `> ${quoteText}\n\n`;
        break;
        
      case "to_do":
        const checked = block.to_do.checked ? "[x]" : "[ ]";
        markdown = indent + `${checked} ` + richTextToMarkdown(block.to_do.rich_text) + "\n";
        break;
        
      default:
        markdown = indent + `<!-- Unsupported block type: ${block.type} -->\n\n`;
    }
    
    if (block.children) {
      markdown += blocksToMarkdown(block.children, indentLevel + 1).join("");
    }
    
    return markdown;
  });
}

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // 获取页面元数据
    const page = await notion.pages.retrieve({ page_id: id });
    
    // 递归获取所有块内容
    const contentBlocks = await getAllBlocks(id);
    
    // 将内容块转换为Markdown格式
    const markdownContent = blocksToMarkdown(contentBlocks).join("");
    
    // 获取页面的封面和图标
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
      content: markdownContent // 添加转换后的Markdown内容
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
}
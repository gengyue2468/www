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

function richTextToMarkdown(richText) {
  return richText
    .map((rt) => {
      let text = rt.text.content;
      const annotations = rt.annotations;
      const link = rt.href;

      if (annotations.code) {
        text = `\`${text}\``;
      } else {
        if (annotations.bold && annotations.italic) {
          text = `***${text}***`;
        } else {
          if (annotations.bold) text = `**${text}**`;
          if (annotations.italic) text = `*${text}*`;
        }
        if (annotations.strikethrough) text = `~~${text}~~`;
      }
      if (link) text = `[${text}](${link})`;

      return text;
    })
    .join("");
}

function blocksToMarkdown(blocks, indentLevel = 0) {
  return blocks.map((block) => {
    const indent = "  ".repeat(indentLevel);
    let markdown = "";

    switch (block.type) {
      case "paragraph":
        let content = richTextToMarkdown(block.paragraph.rich_text);
        content = content.replace(/(\*\*[^*]+\*\*|\*[^*]+\*)(?=[^\s])/g, "$1 ");
        markdown = indent + content + "\n\n";
        break;

      case "heading_1":
        markdown =
          indent +
          "# " +
          richTextToMarkdown(block.heading_1.rich_text) +
          "\n\n";
        break;

      case "heading_2":
        markdown =
          indent +
          "## " +
          richTextToMarkdown(block.heading_2.rich_text) +
          "\n\n";
        break;

      case "heading_3":
        markdown =
          indent +
          "### " +
          richTextToMarkdown(block.heading_3.rich_text) +
          "\n\n";
        break;

      case "bulleted_list_item":
        markdown =
          indent +
          "- " +
          richTextToMarkdown(block.bulleted_list_item.rich_text) +
          "\n";
        break;

      case "numbered_list_item":
        markdown =
          indent +
          "1. " +
          richTextToMarkdown(block.numbered_list_item.rich_text) +
          "\n";
        break;

      case "image": {
        const image = block.image;
        const url =
          image.type === "external" ? image.external.url : image.file.url;
        const caption =
          image.caption.length > 0
            ? richTextToMarkdown(image.caption)
            : "image";
        markdown = indent + `![${caption}](${url})\n\n`;
        break;
      }

      case "video": {
        const video = block.video;
        const url =
          video.type === "external" ? video.external.url : video.file.url;
        const caption =
          video.caption.length > 0 ? richTextToMarkdown(video.caption) : "视频";
        markdown =
          indent +
          `<video src="${url}" controls title="${caption}"></video>\n\n`;
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
        markdown =
          indent +
          `${checked} ` +
          richTextToMarkdown(block.to_do.rich_text) +
          "\n";
        break;

      default:
        markdown =
          indent + `<!-- Unsupported block type: ${block.type} -->\n\n`;
    }

    if (block.children) {
      markdown += blocksToMarkdown(block.children, indentLevel + 1).join("");
    }

    return markdown;
  });
}

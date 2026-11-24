import MarkdownIt from "markdown-it";
import { el as element } from "../../ui/dom.js";
import { formatDateTime } from "../../ui/time.js";

const markdown = new MarkdownIt({ html: false, breaks: true, linkify: true });
const linkOpen = markdown.renderer.rules.link_open;
markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
  tokens[index].attrSet("target", "_blank");
  tokens[index].attrSet("rel", "noopener noreferrer");
  return linkOpen
    ? linkOpen(tokens, index, options, env, renderer)
    : renderer.renderToken(tokens, index, options);
};

// Memo headings belong under the page's single h1.
for (const type of ["heading_open", "heading_close"]) {
  markdown.renderer.rules[type] = (tokens, index, options, _env, renderer) => {
    tokens[index].tag = `h${Math.min(6, Number(tokens[index].tag.slice(1)) + 1)}`;
    return renderer.renderToken(tokens, index, options);
  };
}

export function safeUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, document.baseURI);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    // Keep attachments same-origin so the local preview can proxy them too.
    return url.hostname === "www.gengyue.dev" && url.pathname.startsWith("/api/memos/attachments/")
      ? url.pathname + url.search
      : url.href;
  } catch {
    return null;
  }
}

export function renderMarkdown(content) {
  return markdown.render(content);
}

function createImageViewer(url, alt = "") {
  const viewer = element("image-viewer");
  const link = element("a", "image-viewer-link");
  link.href = url;
  link.setAttribute("aria-label", alt ? `查看大图：${alt}` : "查看附件大图");
  const image = element("img");
  image.src = url;
  image.alt = alt;
  image.loading = "lazy";
  image.decoding = "async";
  link.append(image);
  viewer.append(link);
  return viewer;
}

export function renderMemo(memo) {
  const entry = element("article", "memo-entry");
  entry.id = `memo-${memo.name.slice(6)}`;
  const meta = element("header", "memo-meta");
  const date = new Date(memo.createTime);
  if (Number.isFinite(date.getTime())) {
    const permalink = element("a");
    permalink.href = `#${entry.id}`;
    const time = element("time", "", formatDateTime(date));
    time.dateTime = date.toISOString();
    permalink.append(time);
    meta.append(permalink);
  }
  if (memo.pinned === true) meta.append(element("span", "memo-pinned", "置顶"));
  if (memo.updateTime && memo.updateTime !== memo.createTime && Number.isFinite(Date.parse(memo.updateTime))) {
    const edited = element("time", "memo-edited", "Edited");
    edited.dateTime = new Date(memo.updateTime).toISOString();
    meta.append(edited);
  }
  entry.append(meta);

  const tags = [
    ...new Set((Array.isArray(memo.tags) ? memo.tags : []).filter(tag => typeof tag === "string" && tag.trim())),
  ];
  let content = typeof memo.content === "string" ? memo.content.trimEnd() : "";
  // A trailing tag-only paragraph is represented once in the quiet footer.
  const tail = content.match(/(?:^|\n\s*\n)([^\n]+)$/);
  if (tail && tags.length && tail[1].trim().split(/\s+/).every(word => word.startsWith("#") && tags.includes(word.slice(1)))) {
    content = content.slice(0, tail.index).trimEnd();
  }

  const body = element("div", "memo-content");
  body.innerHTML = renderMarkdown(content);
  for (const image of body.querySelectorAll("img")) {
    image.loading = "lazy";
    image.decoding = "async";
    if (image.closest("a")) continue;
    const url = safeUrl(image.getAttribute("src"));
    if (url) image.replaceWith(createImageViewer(url, image.alt));
  }
  for (const pre of body.querySelectorAll("pre")) {
    const block = element("code-block");
    pre.replaceWith(block);
    block.append(pre);
  }
  entry.append(body);

  const images = element("div", "memo-images");
  const files = element("div", "memo-files");
  for (const attachment of Array.isArray(memo.attachments) ? memo.attachments : []) {
    const url = safeUrl(attachment?.url);
    if (!url) continue;
    const type = typeof attachment.type === "string" ? attachment.type : "";
    if (type.startsWith("image/")) images.append(createImageViewer(url));
    else if (type.startsWith("audio/") || type.startsWith("video/")) {
      const media = element(type.startsWith("audio/") ? "audio" : "video");
      media.controls = true;
      media.preload = "metadata";
      media.playsInline = true;
      media.src = url;
      files.append(media);
    } else {
      const link = element("a", "memo-file", typeof attachment.filename === "string" ? attachment.filename : "下载附件");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      files.append(link);
    }
  }
  if (images.childElementCount) entry.append(images);
  if (files.childElementCount) entry.append(files);
  if (tags.length) entry.append(element("footer", "memo-tags", tags.map(tag => `#${tag}`).join(" ")));
  return entry;
}

import { join, dirname, extname, basename, resolve } from "path";
import { readdir } from "fs/promises";
import type { Dirent } from "fs";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import { formatDate } from "../utils/date.js";
import { addSidenoteConnector } from "../extensions/sidenotes.js";
import { hasMathHtml, mathStylesheet } from "../extensions/math.js";
import { renderPage, applyHooks, applyAfterHooks } from "../utils/page-render.js";
import { injectWebComponentScripts, type BuildHooks } from "../extensions/plugin.js";
import { buildMetaDescription, escapeHtmlAttr, escapeHtmlText, generateKeywords } from "../utils/seo.js";
import { assertSafePathSegment, joinUrlPath } from "../utils/url.js";
import { contentHash } from "../utils/assets.js";
import { AppError, ErrorCode, isENOENT, errorReporter } from "../utils/errors.js";
import config from "../config.js";
import type { AssetManifest, CollectionConfig, CollectionOutput, Post } from "../types.js";
import { generateTableOfContents } from "../utils/markdown.js";

interface PostWithContent extends Post {
  html: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
}

function getTagSlug(tag: string): string {
  const normalized = tag.normalize("NFKC").trim().toLowerCase();
  const slug = normalized
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  if (slug) return slug;

  let hash = 2166136261;
  for (const char of normalized) {
    hash ^= char.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return `tag-${(hash >>> 0).toString(16)}`;
}

function postPath(urlPrefix: string, slug: string): string {
  return joinUrlPath(urlPrefix, slug);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getCollectionDefaults(coll: CollectionConfig) {
  const urlPrefix = coll.urlPrefix || coll.name;
  assertSafePathSegment(urlPrefix, `Collection URL prefix '${coll.name}'`);
  return {
    srcDir: resolve(config.rootDir, coll.srcDir || `./content/${coll.name}`),
    urlPrefix,
    layouts: {
      index: coll.layouts?.index || `${coll.name}-index`,
      post: coll.layouts?.post || `${coll.name}-post`,
      tags: coll.layouts?.tags || "tags",
    },
  };
}

function collectAllTags(posts: Post[]): string[] {
  const allTags: string[] = [];
  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) allTags.push(...post.tags);
  }
  return allTags;
}

function sortPostsByDate<T extends { date?: string; slug: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    const diff = Date.parse(`${b.date}T00:00:00Z`) - Date.parse(`${a.date}T00:00:00Z`);
    if (diff !== 0) return diff;
    return a.slug.localeCompare(b.slug);
  });
}

function generateTagsHTML(allTags: string[], urlPrefix: string): string {
  const tagCounts: Record<string, number> = {};
  for (const tag of allTags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }

  const sortedTags = [...new Set(allTags)].sort((a, b) => {
    const countDiff = tagCounts[b] - tagCounts[a];
    return countDiff !== 0 ? countDiff : a.localeCompare(b);
  });

  const parts: string[] = ['<div class="tags-list">'];
  for (const tag of sortedTags) {
    const slug = getTagSlug(tag);
    const count = tagCounts[tag];
    const size = Math.min(3, Math.max(1, Math.ceil(count / 2)));
    parts.push(`<a href="${joinUrlPath(urlPrefix, "tag", slug)}" class="tag tag-size-${size}" data-count="${count}">#${escapeHtmlText(tag)} <span class="tag-count">(${count})</span></a>`);
  }
  parts.push("</div>");
  return parts.join("");
}

function generatePostTagsHTML(tags: string[] | undefined, urlPrefix: string): string {
  if (!tags || tags.length === 0) return "";
  const parts: string[] = ['<div class="post-tags">'];
  for (const tag of tags) {
    const slug = getTagSlug(tag);
    parts.push(`<a href="${joinUrlPath(urlPrefix, "tag", slug)}" class="tag">#${escapeHtmlText(tag)}</a>`);
  }
  parts.push("</div>");
  return parts.join("");
}

function generatePostNavigationHTML(prevPost: PostWithContent | null, nextPost: PostWithContent | null, urlPrefix: string): string {
  if (!prevPost && !nextPost) return "";
  const previous = prevPost
    ? `<a class="post-nav-link post-nav-previous" href="${postPath(urlPrefix, prevPost.slug)}"><span>上一篇</span><strong>${escapeHtmlText(prevPost.title)}</strong></a>`
    : `<span class="post-nav-link post-nav-empty" aria-hidden="true"></span>`;
  const next = nextPost
    ? `<a class="post-nav-link post-nav-next" href="${postPath(urlPrefix, nextPost.slug)}"><span>下一篇</span><strong>${escapeHtmlText(nextPost.title)}</strong></a>`
    : `<span class="post-nav-link post-nav-empty" aria-hidden="true"></span>`;
  return `<nav class="post-nav" aria-label="文章导航">${previous}${next}</nav>`;
}

function generatePostActionsHTML(markdownPath: string, pagePath: string, commentHref?: string): string {
  const markdownUrl = `${config.site.url}${markdownPath}`;
  const pageUrl = `${config.site.url}${pagePath}`;
  const prompt = `Please read this article and summarize its key points: ${markdownUrl}`;
  const menuId = `post-actions-menu-${contentHash(pagePath)}`;
  const link = (label: string, href: string, attributes = "") =>
    `<a href="${escapeHtmlAttr(href)}"${attributes}>${escapeHtmlText(label)}</a>`;
  const external = ' target="_blank" rel="noopener noreferrer"';

  return `<post-actions class="post-actions nav-dropdown-wrapper">
    <input type="checkbox" id="${menuId}" class="nav-menu-checkbox" aria-label="Actions">
    <label class="nav-menu-overlay" for="${menuId}" aria-hidden="true"></label>
    <label class="nav-menu-label post-actions-button" for="${menuId}">Actions</label>
    <div class="nav-dropdown-menu">
      ${link("View Markdown", markdownPath)}
      ${link("Copy Markdown", markdownPath, ' data-copy-markdown rel="nofollow"')}
      ${link("Copy URL", pageUrl, ' data-copy-url rel="nofollow"')}
      ${link("Ask ChatGPT", `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, external)}
      ${link("Ask Claude", `https://claude.ai/new?q=${encodeURIComponent(prompt)}`, external)}
      ${link("Ask Gemini", `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`, external)}
      ${link("Ask Grok", `https://grok.com/?q=${encodeURIComponent(prompt)}`, external)}
      ${link("Ask DeepSeek", `https://chat.deepseek.com/?q=${encodeURIComponent(prompt)}`, external)}
      ${commentHref ? link("Comment this post", commentHref) : ""}
    </div>
  </post-actions>`;
}

export function generateIssoCommentsHTML(route: string, title: string): string {
  const capAttributes = config.isso.cap.enabled
    ? ` data-cap-enabled="true" data-cap-script="${escapeHtmlAttr(config.isso.cap.widgetScriptUrl)}" data-cap-endpoint="${escapeHtmlAttr(config.isso.cap.apiEndpoint)}"`
    : "";
  return `<section class="post-comments" aria-labelledby="post-comments-title">
  <h2 id="post-comments-title"><span class="post-comments-count" aria-live="polite"></span>评论</h2>
  <isso-comments
    data-isso-script="${escapeHtmlAttr(config.isso.scriptUrl)}"
    data-isso-endpoint="${escapeHtmlAttr(config.isso.endpoint)}"
    data-isso-page-author-hashes="${escapeHtmlAttr(config.isso.pageAuthorHashes)}"${capAttributes}
  >
    <div id="isso-thread" data-isso-id="${escapeHtmlAttr(route)}" data-title="${escapeHtmlAttr(title)}">
      <noscript>需要启用 JavaScript 才能查看和发表评论。</noscript>
    </div>
  </isso-comments>
</section>`;
}

export function generateIssoScript(): string {
  /*
  const capScript = config.isso.cap.enabled
    ? `<script type="module" src="${escapeHtmlAttr(config.isso.cap.widgetScriptUrl)}"></script>`
    : "";
  const capSetup = config.isso.cap.enabled
    ? `<script>
(() => {
  const thread = document.getElementById("isso-thread");
  if (!thread) return;

  const capEndpoint = ${JSON.stringify(config.isso.cap.apiEndpoint)};
  const mounted = new WeakSet();

  const mountCap = (postbox) => {
    if (mounted.has(postbox)) return;

    const textareaWrapper = postbox.querySelector(".isso-textarea-wrapper");
    if (!textareaWrapper) return;
    mounted.add(postbox);

    const gate = document.createElement("div");
    gate.className = "isso-cap-gate";
    gate.dataset.state = "required";
    gate.setAttribute("role", "group");
    gate.setAttribute("aria-label", "发布前人机验证");

    const widget = document.createElement("cap-widget");
    widget.setAttribute("required", "");
    widget.setAttribute("data-cap-api-endpoint", capEndpoint);
    widget.setAttribute("data-cap-disable-haptics", "");

    gate.append(widget);
    textareaWrapper.append(gate);

    let solved = false;
    widget.addEventListener("solve", () => {
      solved = true;
      gate.dataset.state = "solved";
    });
    widget.addEventListener("reset", () => {
      solved = false;
      gate.dataset.state = "required";
    });
    widget.addEventListener("error", () => {
      solved = false;
      gate.dataset.state = "required";
    });

    // Isso binds directly to the submit input, so capture the click before it reaches Isso.
    postbox.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== "submit") return;
      if (solved) {
        solved = false;
        gate.dataset.state = "required";
        if (typeof widget.reset === "function") widget.reset();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      widget.scrollIntoView({ behavior: "smooth", block: "center" });
    }, true);
  };

  const scan = () => thread.querySelectorAll(".isso-postbox").forEach(mountCap);
  scan();
  new MutationObserver(scan).observe(thread, { childList: true, subtree: true });
})();
</script>`
    : "";
  const voteSetup = `<script>
(() => {
  const thread = document.getElementById("isso-thread");
  if (!thread) return;

  const enhanceVotes = () => {
    thread.querySelectorAll(".isso-comment-footer").forEach((footer) => {
      const score = footer.querySelector(":scope > .isso-votes");
      const upvote = footer.querySelector(":scope > .isso-upvote");
      if (!score || !upvote) return;

      footer.querySelector(":scope > .isso-downvote")?.remove();

      const value = score.textContent?.trim() || "0";
      if (upvote.dataset.voteIcon !== "true") {
        upvote.dataset.voteIcon = "true";
        upvote.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" /><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" /></svg>';
      }

      let count = upvote.querySelector(":scope > .isso-vote-count");
      if (!count) {
        count = document.createElement("span");
        count.className = "isso-vote-count";
        upvote.append(count);
      }
      if (count.textContent !== value) count.textContent = value;

      score.setAttribute("aria-hidden", "true");
    });
  };

  enhanceVotes();
  new MutationObserver(enhanceVotes).observe(thread, {
    childList: true,
    characterData: true,
    subtree: true,
  });
})();
</script>`;

  return `${capScript}
<script
  data-isso="${escapeHtmlAttr(config.isso.endpoint)}"
  data-isso-css="false"
  data-isso-lang="zh_CN"
  data-isso-sorting="newest"
  data-isso-avatar="false"
  data-isso-vote="true"
  data-isso-page-author-hashes="${escapeHtmlAttr(config.isso.pageAuthorHashes)}"
  data-isso-comment-page-author-suffix-text-zh-cn="Owner"
  src="${escapeHtmlAttr(config.isso.scriptUrl)}"
 ></script>
${capSetup}
${voteSetup}
<script>
(() => {
  const thread = document.getElementById("isso-thread");
  const count = document.querySelector(".post-comments-count");
  if (!thread || !count) return;

  const updateCount = () => {
    const total = thread.querySelectorAll("#isso-root .isso-comment").length;
    count.textContent = total + " 条";
  };

  updateCount();
  new MutationObserver(updateCount).observe(thread, { childList: true, subtree: true });
})();
</script>`;
  */
  return "";
}

function generatePostsListHTML(posts: Post[], urlPrefix: string): string {
  if (posts.length === 0) return "<p>No posts found.</p>";

  const postsByYear: Record<string, Post[]> = {};
  for (const post of posts) {
    const year = post.date ? post.date.slice(0, 4) : "";
    (postsByYear[year] ??= []).push(post);
  }

  const years = Object.keys(postsByYear).sort((a, b) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return parseInt(b) - parseInt(a);
  });

  const parts: string[] = [];
  for (const year of years) {
    const yearPosts = postsByYear[year];
    if (year) parts.push(`<h3>${year}</h3>`);
    parts.push('<ul class="posts-list">');
    for (const post of yearPosts) {
      parts.push(`<li class="post-item">`);
      parts.push(`<a href="${postPath(urlPrefix, post.slug)}">${escapeHtmlText(post.title)}</a>`);
      if (post.date) {
        parts.push(` <span class="post-date-inline">${formatDate(post.date)}</span>`);
      }
      parts.push("</li>");
    }
    parts.push("</ul>");
  }
  return parts.join("");
}

async function loadPostsFromDir(
  srcDir: string
): Promise<PostWithContent[]> {
  const posts: PostWithContent[] = [];

  let files: Dirent[];
  try {
    files = await readdir(srcDir, { withFileTypes: true });
  } catch (err) {
    if (isENOENT(err)) {
      throw new AppError(`Content directory not found: ${srcDir}`, ErrorCode.FILE_NOT_FOUND, { dir: srcDir });
    }
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { dir: srcDir });
  }

  const mdFiles = files.filter(file => {
    if (file.isSymbolicLink()) {
      throw new AppError(`Symbolic links are not allowed in content directories: ${join(srcDir, file.name)}`, ErrorCode.FILE_READ_ERROR, { dir: srcDir, file: file.name });
    }
    return file.isFile() && extname(file.name) === ".md";
  });

  const postPromises = mdFiles.map(async (fileEntry) => {
    const file = fileEntry.name;
    const filePath = join(srcDir, file);
    const slug = basename(file, ".md");
    try {
      assertSafePathSegment(slug, `Post slug '${slug}'`);
    } catch (err) {
      throw new AppError((err as Error).message, ErrorCode.CONFIG_ERROR, { filePath, slug });
    }
    const { frontmatter, html } = await renderMarkdown(filePath);

    return {
      slug,
      title: (frontmatter.title as string) || slug,
      date: (frontmatter.date as string) || "",
      updated: (frontmatter.updated as string) || "",
      excerpt: (frontmatter.excerpt as string) || "",
      summary: (frontmatter.summary as string) || "",
      tags: (frontmatter.tags as string[]) || [],
      html,
      filePath,
      frontmatter,
    };
  });

  const results = await Promise.all(postPromises);
  posts.push(...results);

  return sortPostsByDate(posts);
}

function buildCollectionIndex(
  posts: Post[],
  coll: CollectionConfig,
  urlPrefix: string,
  baseLayout: string,
  indexLayout: string,
  assets: AssetManifest,
  year?: number
): string {
  const allTags = collectAllTags(posts);
  const tagsHtml = coll.tags ? `<div style="margin-top: 3rem;">${generateTagsHTML(allTags, urlPrefix)}</div>` : "";
  const postsListHtml = posts.length > 0 ? generatePostsListHTML(posts, urlPrefix) : "<p>No posts yet.</p>";

  const contentData = { 
    title: capitalize(coll.name), 
    postsList: postsListHtml + tagsHtml 
  };
  const renderedContent = renderTemplate(indexLayout, contentData);

  const indexTitle = `${capitalize(coll.name)} - ${config.site.title}`;
  const indexDescription = buildMetaDescription({
    title: coll.name,
    primary: config.site.description,
    fallbackText: `Latest posts from ${config.site.title}`,
    siteDescription: config.site.description,
  });

  const output = renderPage(baseLayout, {
    route: `/${urlPrefix}`,
    title: indexTitle,
    description: indexDescription,
    content: renderedContent,
    stylesheetHref: assets.stylesheetHref,
    fontStylesheetHref: assets.fontStylesheetHref,
    ogTags: { 
      title: indexTitle, 
      description: indexDescription, 
      url: `${config.site.url}/${urlPrefix}`, 
      type: "website", 
      siteName: config.site.title 
    },
    jsonLd: { 
      type: "CollectionPage", 
      title: indexTitle, 
      description: indexDescription, 
      url: `${config.site.url}/${urlPrefix}`, 
      numberOfItems: posts.length 
    },
    breadcrumbs: [
      { name: config.site.title, url: config.site.url },
      { name: capitalize(coll.name), url: `${config.site.url}/${urlPrefix}` },
    ],
    year,
  });
  return injectWebComponentScripts(output, assets);
}

async function buildPostPages(
  posts: PostWithContent[],
  coll: CollectionConfig,
  urlPrefix: string,
  baseLayout: string,
  postLayout: string,
  assets: AssetManifest,
  year?: number,
  hooks?: BuildHooks
): Promise<void> {
  const buildPromises = posts.map(async (post, i) => {
    let { html, frontmatter } = post;
    let title = (frontmatter.title as string) || post.slug;

    const hookResult = await applyHooks(hooks, "post", post.slug, frontmatter, html);
    frontmatter = hookResult.frontmatter;
    html = hookResult.html;
    title = (frontmatter.title as string) || post.slug;
    html = addSidenoteConnector(html);
    const safeTitle = escapeHtmlText(title);

    post.frontmatter = frontmatter;
    post.html = html;
    post.title = title;
    post.date = (frontmatter.date as string) || "";
    post.updated = (frontmatter.updated as string) || undefined;
    post.excerpt = (frontmatter.excerpt as string) || "";
    post.summary = (frontmatter.summary as string) || "";
    post.tags = (frontmatter.tags as string[]) || [];

    const formattedDate = formatDate(frontmatter.date as string);
    const prevPost = i > 0 ? posts[i - 1] : null;
    const nextPost = i < posts.length - 1 ? posts[i + 1] : null;

    const navHtml = generatePostNavigationHTML(prevPost, nextPost, urlPrefix);
    const tocHtml = generateTableOfContents(html);

    const headLinkParts: string[] = [];
    if (prevPost) headLinkParts.push(`<link rel="prev" href="${postPath(urlPrefix, prevPost.slug)}" />`);
    if (nextPost) headLinkParts.push(`<link rel="next" href="${postPath(urlPrefix, nextPost.slug)}" />`);

    const postTagsHtml = generatePostTagsHTML(frontmatter.tags as string[], urlPrefix);
    const dateClass = formattedDate ? "" : " hidden";
    const plainText = html.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
    const wordCount = `${plainText.length} 字`;
    const markdownPath = `${postPath(urlPrefix, post.slug)}.md`;
    const commentsEnabled = config.isso.enabled && frontmatter.comment === true;
    const sourceMdLink = config.llms?.enabled
      ? generatePostActionsHTML(
          markdownPath,
          postPath(urlPrefix, post.slug),
          commentsEnabled ? "#post-comments-title" : undefined,
        )
      : "";
    const dateSeparator = formattedDate ? " · " : "";
    const contentData = {
      title: safeTitle,
      date: formattedDate,
      dateClass,
      dateSeparator,
      wordCount,
      content: html,
      toc: tocHtml,
      tags: postTagsHtml,
      navigation: navHtml,
      sourceMdLink,
      comments: commentsEnabled ? generateIssoCommentsHTML(postPath(urlPrefix, post.slug), title) : "",
    };
    const renderedContent = renderTemplate(postLayout, contentData);

    const description = buildMetaDescription({
      title,
      primary:
        (frontmatter.summary as string) ||
        (frontmatter.excerpt as string) ||
        (frontmatter.description as string),
      fallbackHtml: html,
      siteDescription: config.site.description,
    });

    if (hasMathHtml(html)) headLinkParts.push(mathStylesheet(assets.katexStylesheetHref));
    const headLinks = headLinkParts.join("\n    ");
    const postTags = frontmatter.tags as string[] | undefined;
    const fullTitle = `${title} - ${config.site.title}`;

    let output = renderPage(baseLayout, {
      route: postPath(urlPrefix, post.slug),
      title: fullTitle,
      description,
      content: renderedContent,
      stylesheetHref: assets.stylesheetHref,
      fontStylesheetHref: assets.fontStylesheetHref,
      keywords: generateKeywords(postTags),
      ogTags: {
        title: fullTitle,
        description,
        url: `${config.site.url}${postPath(urlPrefix, post.slug)}`,
        type: "article",
        siteName: config.site.title,
        tags: postTags,
        publishedTime: frontmatter.date as string,
        modifiedTime: (frontmatter.updated as string) || undefined,
        authorName: config.site.author,
      },
      jsonLd: {
        type: "BlogPosting",
        title,
        description,
        url: `${config.site.url}${postPath(urlPrefix, post.slug)}`,
        date: frontmatter.date as string,
        dateModified: (frontmatter.updated as string) || undefined,
        tags: postTags,
      },
      breadcrumbs: [
        { name: config.site.title, url: config.site.url },
        { name: capitalize(coll.name), url: `${config.site.url}/${urlPrefix}` },
        { name: title, url: `${config.site.url}${postPath(urlPrefix, post.slug)}` },
      ],
      year,
      headLinks,
    });

    output = await applyAfterHooks(hooks, "post", post.slug, output);
    output = injectWebComponentScripts(output, assets);

    const outputPath = join(config.dirs.dist, urlPrefix, post.slug, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFileContent(outputPath, output);

    console.log(`✓ Built /${urlPrefix}/${post.slug}`);
  });

  const results = await Promise.allSettled(buildPromises);
  for (const result of results) {
    if (result.status === "rejected") {
      errorReporter.report(
        AppError.fromError(result.reason, ErrorCode.BUILD_ERROR, {
          phase: "post-pages",
          collection: coll.name,
        })
      );
    }
  }
}

async function buildTagPages(
  posts: PostWithContent[],
  coll: CollectionConfig,
  urlPrefix: string,
  baseLayout: string,
  tagsLayout: string,
  assets: AssetManifest,
  year?: number
): Promise<void> {
  const tagMap = new Map<string, PostWithContent[]>();

  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        const existing = tagMap.get(tag);
        if (existing) {
          existing.push(post);
        } else {
          tagMap.set(tag, [post]);
        }
      }
    }
  }

  if (tagMap.size === 0) return;

  const tagSlugOwners = new Map<string, string>();
  for (const tag of tagMap.keys()) {
    const slug = getTagSlug(tag);
    const owner = tagSlugOwners.get(slug);
    if (owner && owner !== tag) {
      throw new AppError(`Tag slug collision: '${owner}' and '${tag}' both map to '${slug}'`, ErrorCode.CONFIG_ERROR, {
        collection: coll.name,
        slug,
      });
    }
    tagSlugOwners.set(slug, tag);
  }

  const allTagsGlobal = collectAllTags(posts);

  const tagPromises: Promise<void>[] = [];

  for (const [tag, taggedPosts] of tagMap) {
    tagPromises.push((async () => {
      const slug = getTagSlug(tag);

      const sortedPosts = sortPostsByDate(taggedPosts);

      const tagNavHtml = generateTagsHTML(allTagsGlobal, urlPrefix);
      const postsListHtml = generatePostsListHTML(sortedPosts, urlPrefix);

      const contentData = {
        title: `Tag: #${escapeHtmlText(tag)}`,
        tagsList: tagNavHtml,
        postsList: postsListHtml,
      };
      const renderedContent = renderTemplate(tagsLayout, contentData);

      const tagPageTitle = `#${tag} - ${config.site.title}`;
      const tagDescription = buildMetaDescription({
        title: `#${tag}`,
        primary: `Posts tagged with "${tag}" on ${config.site.title}`,
        fallbackText: config.site.description,
        siteDescription: config.site.description,
      });

      const output = injectWebComponentScripts(renderPage(baseLayout, {
        route: `/${urlPrefix}/tag/${slug}`,
        title: tagPageTitle,
        description: tagDescription,
        content: renderedContent,
        stylesheetHref: assets.stylesheetHref,
        fontStylesheetHref: assets.fontStylesheetHref,
        keywords: generateKeywords([tag]),
        robotsMeta: '<meta name="robots" content="noindex, follow" />',
        ogTags: { 
          title: tagPageTitle, 
          description: tagDescription, 
          url: `${config.site.url}/${urlPrefix}/tag/${slug}`, 
          type: "website", 
          siteName: config.site.title, 
          tags: [tag] 
        },
        jsonLd: { 
          type: "CollectionPage", 
          title: tagPageTitle, 
          description: tagDescription, 
          url: `${config.site.url}/${urlPrefix}/tag/${slug}`, 
          numberOfItems: taggedPosts.length 
        },
        breadcrumbs: [
          { name: config.site.title, url: config.site.url },
          { name: capitalize(coll.name), url: `${config.site.url}/${urlPrefix}` },
          { name: `#${tag}`, url: `${config.site.url}/${urlPrefix}/tag/${slug}` },
        ],
        year,
      }), assets);

      const outputPath = join(config.dirs.dist, urlPrefix, "tag", slug, "index.html");
      await ensureDir(dirname(outputPath));
      await writeFileContent(outputPath, output);
      console.log(`✓ Built /${urlPrefix}/tag/${slug}`);
    })());
  }

  await Promise.all(tagPromises);

  if (allTagsGlobal.length === 0) return;

  const tagsCloudHtml = generateTagsHTML(allTagsGlobal, urlPrefix);
  const uniqueTagCount = new Set(allTagsGlobal).size;

  const contentData = {
    title: "All Tags",
    tagsList: '',
    postsList: `<p>共 ${uniqueTagCount} 个标签，${posts.length} 篇文章</p><div class="tags-cloud">${tagsCloudHtml}</div>`,
  };
  const renderedContent = renderTemplate(tagsLayout, contentData);

  const tagsIndexTitle = `Tags - ${config.site.title}`;
  const tagsIndexDescription = buildMetaDescription({
    title: "Tags",
    primary: `Browse all tags and discover posts on ${config.site.title}`,
    fallbackText: config.site.description,
    siteDescription: config.site.description,
  });

  const output = injectWebComponentScripts(renderPage(baseLayout, {
    route: `/${urlPrefix}/tag`,
    title: tagsIndexTitle,
    description: tagsIndexDescription,
    content: renderedContent,
    stylesheetHref: assets.stylesheetHref,
    fontStylesheetHref: assets.fontStylesheetHref,
    robotsMeta: '<meta name="robots" content="noindex, follow" />',
    ogTags: { 
      title: tagsIndexTitle, 
      description: tagsIndexDescription, 
      url: `${config.site.url}/${urlPrefix}/tag`, 
      type: "website", 
      siteName: config.site.title 
    },
    jsonLd: { 
      type: "CollectionPage", 
      title: tagsIndexTitle, 
      description: tagsIndexDescription, 
      url: `${config.site.url}/${urlPrefix}/tag`, 
      numberOfItems: uniqueTagCount
    },
    breadcrumbs: [
      { name: config.site.title, url: config.site.url },
      { name: capitalize(coll.name), url: `${config.site.url}/${urlPrefix}` },
      { name: "Tags", url: `${config.site.url}/${urlPrefix}/tag` },
    ],
    year,
  }), assets);

  const outputPath = join(config.dirs.dist, urlPrefix, "tag", "index.html");
  await ensureDir(dirname(outputPath));
  await writeFileContent(outputPath, output);
  console.log(`✓ Built /${urlPrefix}/tag -> ${outputPath}`);
}

export async function buildCollection(
  coll: CollectionConfig,
  baseLayout: string,
  layoutsMap: Record<string, string>,
  assets: AssetManifest,
  year?: number,
  hooks?: BuildHooks
): Promise<CollectionOutput> {
  const defaults = getCollectionDefaults(coll);
  const { srcDir, urlPrefix } = defaults;
  const indexLayout = layoutsMap[defaults.layouts.index];
  const postLayout = layoutsMap[defaults.layouts.post];
  const tagsLayout = layoutsMap[defaults.layouts.tags];

  const posts = await loadPostsFromDir(srcDir);

  if (indexLayout) {
    const output = buildCollectionIndex(posts, coll, urlPrefix, baseLayout, indexLayout, assets, year);
    const outputPath = join(config.dirs.dist, urlPrefix, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFileContent(outputPath, output);
    console.log(`✓ Built /${urlPrefix} -> ${outputPath}`);
  }

  if (postLayout) {
    await buildPostPages(posts, coll, urlPrefix, baseLayout, postLayout, assets, year, hooks);
  }

  if (coll.tags && tagsLayout) {
    await buildTagPages(posts, coll, urlPrefix, baseLayout, tagsLayout, assets, year);
  }

  return {
    name: coll.name,
    urlPrefix,
    srcDir,
    items: posts.map(p => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      updated: p.updated,
      excerpt: p.excerpt,
      summary: p.summary,
      tags: p.tags,
    })),
    renderedItems: posts.map(p => ({
      slug: p.slug,
      html: p.html,
    })),
  };
}

export function getRequiredLayouts(collections: CollectionConfig[]): string[] {
  const layouts = new Set<string>();
  for (const coll of collections) {
    const defaults = getCollectionDefaults(coll);
    layouts.add(defaults.layouts.index);
    layouts.add(defaults.layouts.post);
    if (coll.tags) layouts.add(defaults.layouts.tags);
  }
  return [...layouts];
}

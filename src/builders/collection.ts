import { join, dirname, extname, basename } from "path";
import { readdir } from "fs/promises";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate } from "../utils/template.js";
import { formatDate } from "../utils/date.js";
import { hasMermaidCode as checkMermaidCode, mermaidScript } from "../extensions/mermaid.js";
import { renderPage, applyHooks, applyAfterHooks } from "../utils/page-render.js";
import type { BuildHooks } from "../extensions/plugin.js";
import type { BuildCacheManager } from "../utils/cache.js";
import {
  buildMetaDescription,
  generateKeywords,
  escapeHtmlText,
  escapeHtmlAttr,
} from "../utils/seo.js";
import config from "../config.js";
import type { CollectionConfig, CollectionOutput, Post } from "../types.js";

interface PostWithContent extends Post {
  html: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
  changed: boolean;
}

function getTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    parts.push(`<a href="/${urlPrefix}/tag/${slug}" class="tag tag-size-${size}" data-count="${count}">#${tag} <span class="tag-count">(${count})</span></a>`);
  }
  parts.push("</div>");
  return parts.join("");
}

function generatePostTagsHTML(tags: string[] | undefined, urlPrefix: string): string {
  if (!tags || tags.length === 0) return "";
  const parts: string[] = ['<div class="post-tags" style="margin-top: 2rem; margin-bottom: 1rem;">'];
  for (const tag of tags) {
    const slug = getTagSlug(tag);
    parts.push(`<a href="/${urlPrefix}/tag/${slug}" class="tag">#${tag}</a>`);
  }
  parts.push("</div>");
  return parts.join("");
}

function generatePostsListHTML(posts: Post[], urlPrefix: string): string {
  if (posts.length === 0) return "<p>No posts found.</p>";

  const postsByYear: Record<string, Post[]> = {};
  for (const post of posts) {
    const year = post.date ? new Date(post.date).getFullYear().toString() : "";
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
      parts.push(`<a href="/${urlPrefix}/${post.slug}">${post.title}</a>`);
      if (post.date) {
        parts.push(` <span class="post-date-inline">${formatDate(post.date)}</span>`);
      }
      parts.push("</li>");
    }
    parts.push("</ul>");
  }
  return parts.join("");
}

function getCollectionDefaults(coll: CollectionConfig) {
  return {
    srcDir: coll.srcDir || `./src/content/${coll.name}`,
    urlPrefix: coll.urlPrefix || coll.name,
    layouts: {
      index: coll.layouts?.index || `${coll.name}-index`,
      post: coll.layouts?.post || `${coll.name}-post`,
      tags: coll.layouts?.tags || "tags",
    },
  };
}

export async function buildCollection(
  coll: CollectionConfig,
  baseLayout: string,
  layoutsMap: Record<string, string>,
  year?: number,
  css?: string,
  cacheManager?: BuildCacheManager,
  hooks?: BuildHooks
): Promise<CollectionOutput> {
  const defaults = getCollectionDefaults(coll);
  const { srcDir, urlPrefix } = defaults;
  const indexLayout = layoutsMap[defaults.layouts.index];
  const postLayout = layoutsMap[defaults.layouts.post];
  const tagsLayout = layoutsMap[defaults.layouts.tags];

  const posts: PostWithContent[] = [];

  try {
    const files = await readdir(srcDir);
    const mdFiles = files.filter(file => extname(file) === ".md");

    const postPromises = mdFiles.map(async (file) => {
      const filePath = join(srcDir, file);

      let changed = true;
      if (cacheManager) {
        changed = await cacheManager.hasBlogPostChanged(filePath);
      }

      const { frontmatter, html } = await renderMarkdown(filePath);
      const slug = basename(file, ".md");

      return {
        slug,
        title: (frontmatter.title as string) || slug,
        date: (frontmatter.date as string) || "",
        excerpt: (frontmatter.excerpt as string) || "",
        summary: (frontmatter.summary as string) || "",
        tags: (frontmatter.tags as string[]) || [],
        html,
        filePath,
        frontmatter,
        changed,
      };
    });

    const results = await Promise.all(postPromises);
    posts.push(...results);
  } catch {
    // Directory doesn't exist
  }

  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Build index page
  if (indexLayout) {
    const allTags: string[] = [];
    for (const post of posts) {
      if (post.tags && Array.isArray(post.tags)) allTags.push(...post.tags);
    }

    const tagsHtml = coll.tags ? `<div style="margin-top: 3rem;">${generateTagsHTML(allTags, urlPrefix)}</div>` : "";
    const postsListHtml = posts.length > 0 ? generatePostsListHTML(posts, urlPrefix) : "<p>No posts yet.</p>";

    const contentData = { title: coll.name.charAt(0).toUpperCase() + coll.name.slice(1), postsList: postsListHtml + tagsHtml };
    const renderedContent = renderTemplate(indexLayout, contentData);

    const indexTitle = `${coll.name.charAt(0).toUpperCase() + coll.name.slice(1)} - ${config.site.title}`;
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
      css: css || "",
      ogTags: { title: indexTitle, description: indexDescription, url: `${config.site.url}/${urlPrefix}`, type: "website", siteName: config.site.title },
      jsonLd: { type: "CollectionPage", title: indexTitle, description: indexDescription, url: `${config.site.url}/${urlPrefix}`, numberOfItems: posts.length },
      year,
    });

    const outputPath = join(config.dirs.dist, urlPrefix, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFileContent(outputPath, output);
    console.log(`✓ Built /${urlPrefix} -> ${outputPath}`);
  }

  // Build post pages
  if (postLayout) {
    const buildPromises = posts.map(async (post, i) => {
      if (cacheManager && !post.changed) {
        console.log(`  (cached) /${urlPrefix}/${post.slug}`);
        return;
      }

      let { html, frontmatter } = post;
      const title = (frontmatter.title as string) || post.slug;

      const hookResult = await applyHooks(hooks, "post", post.slug, frontmatter, html);
      frontmatter = hookResult.frontmatter;
      html = hookResult.html;

      const formattedDate = formatDate(frontmatter.date as string);
      const prevPost = i > 0 ? posts[i - 1] : null;
      const nextPost = i < posts.length - 1 ? posts[i + 1] : null;

      let navHtml = "";
      if (prevPost || nextPost) {
        const navParts: string[] = [`<nav class="post-nav">`];
        if (prevPost) navParts.push(`<a href="/${urlPrefix}/${prevPost.slug}">← ${prevPost.title}</a>`);
        if (nextPost) navParts.push(`<a href="/${urlPrefix}/${nextPost.slug}">${nextPost.title} →</a>`);
        navParts.push("</nav>");
        navHtml = navParts.join("");
      }

      const postTagsHtml = generatePostTagsHTML(frontmatter.tags as string[], urlPrefix);
      const dateClass = formattedDate ? "" : " hidden";
      const plainText = html.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
      const wordCount = `${plainText.length} 字`;
      const sourceMdLink = config.llms?.enabled
        ? `<a href="/${urlPrefix}/${post.slug}.md" class="md-link">.md</a>`
        : "";
      const dateSeparator = formattedDate ? " · " : "";

      const contentData = {
        title,
        date: formattedDate,
        dateClass,
        dateSeparator,
        wordCount,
        content: html,
        tags: postTagsHtml,
        navigation: navHtml,
        sourceMdLink,
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

      const hasMermaid = html.includes('class="mermaid"') || checkMermaidCode(html);
      const scripts = hasMermaid ? mermaidScript : "";
      const postTags = frontmatter.tags as string[] | undefined;
      const fullTitle = `${title} - ${config.site.title}`;

      let output = renderPage(baseLayout, {
        route: `/${urlPrefix}/${post.slug}`,
        title: fullTitle,
        description,
        content: renderedContent,
        css: css || "",
        scripts,
        keywords: generateKeywords(postTags),
        ogTags: {
          title: fullTitle,
          description,
          url: `${config.site.url}/${urlPrefix}/${post.slug}`,
          type: "article",
          siteName: config.site.title,
          tags: postTags,
        },
        jsonLd: {
          type: "BlogPosting",
          title,
          description,
          url: `${config.site.url}/${urlPrefix}/${post.slug}`,
          date: frontmatter.date as string,
          tags: postTags,
        },
        year,
      });

      output = await applyAfterHooks(hooks, "post", post.slug, output);

      const outputPath = join(config.dirs.dist, urlPrefix, post.slug, "index.html");
      await ensureDir(dirname(outputPath));
      await writeFileContent(outputPath, output);

      if (cacheManager) {
        await cacheManager.updateBlogPostMtime(post.filePath);
      }

      console.log(`✓ Built /${urlPrefix}/${post.slug}`);
    });

    await Promise.all(buildPromises);
  }

  // Build tag pages
  if (coll.tags && tagsLayout) {
    await buildCollectionTagPages(posts, coll, baseLayout, tagsLayout, urlPrefix, year, css);
  }

  return {
    name: coll.name,
    urlPrefix,
    srcDir,
    items: posts.map(p => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      excerpt: p.excerpt,
      summary: p.summary,
      tags: p.tags,
    })),
  };
}

async function buildCollectionTagPages(
  posts: PostWithContent[],
  coll: CollectionConfig,
  baseLayout: string,
  tagsLayout: string,
  urlPrefix: string,
  year?: number,
  css?: string
): Promise<void> {
  const tagMap = new Map<string, PostWithContent[]>();

  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        tagMap.set(tag, [...(tagMap.get(tag) || []), post]);
      }
    }
  }

  if (tagMap.size === 0) return;

  const anyPostChanged = posts.some(p => p.changed);

  const tagPromises: Promise<void>[] = [];

  for (const [tag, taggedPosts] of tagMap) {
    tagPromises.push((async () => {
      const slug = getTagSlug(tag);

      // Skip if no post in this tag changed
      if (!anyPostChanged && !taggedPosts.some(p => p.changed)) {
        console.log(`  (cached) /${urlPrefix}/tag/${slug}`);
        return;
      }

      taggedPosts.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      const allTags: string[] = [];
      for (const post of posts) {
        if (post.tags && Array.isArray(post.tags)) allTags.push(...post.tags);
      }

      const tagNavHtml = generateTagsHTML(allTags, urlPrefix);
      const postsListHtml = generatePostsListHTML(taggedPosts, urlPrefix);

      const contentData = {
        title: `Tag: #${tag}`,
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

      const output = renderPage(baseLayout, {
        route: `/${urlPrefix}/tag/${slug}`,
        title: tagPageTitle,
        description: tagDescription,
        content: renderedContent,
        css: css || "",
        keywords: generateKeywords([tag]),
        ogTags: { title: tagPageTitle, description: tagDescription, url: `${config.site.url}/${urlPrefix}/tag/${slug}`, type: "website", siteName: config.site.title, tags: [tag] },
        jsonLd: { type: "CollectionPage", title: tagPageTitle, description: tagDescription, url: `${config.site.url}/${urlPrefix}/tag/${slug}`, numberOfItems: taggedPosts.length },
        year,
      });

      const outputPath = join(config.dirs.dist, urlPrefix, "tag", slug, "index.html");
      await ensureDir(dirname(outputPath));
      await writeFileContent(outputPath, output);
      console.log(`✓ Built /${urlPrefix}/tag/${slug}`);
    })());
  }

  await Promise.all(tagPromises);

  // Tag index page
  if (!anyPostChanged) {
    console.log(`  (cached) /${urlPrefix}/tag`);
    return;
  }

  const allTags: string[] = [];
  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) allTags.push(...post.tags);
  }
  if (allTags.length === 0) return;

  const tagCounts: Record<string, number> = {};
  for (const tag of allTags) tagCounts[tag] = (tagCounts[tag] || 0) + 1;

  const sortedTags = [...new Set(allTags)].sort((a, b) => {
    const countDiff = tagCounts[b] - tagCounts[a];
    return countDiff !== 0 ? countDiff : a.localeCompare(b);
  });

  const tagsCloudParts: string[] = ['<div class="tags-cloud">'];
  for (const tag of sortedTags) {
    const slug = getTagSlug(tag);
    const count = tagCounts[tag];
    const size = Math.min(3, Math.max(1, Math.ceil(count / 2)));
    tagsCloudParts.push(`<a href="/${urlPrefix}/tag/${slug}" class="tag tag-size-${size}" data-count="${count}">#${tag} <span class="tag-count">(${count})</span></a>`);
  }
  tagsCloudParts.push('</div>');

  const contentData = {
    title: "All Tags",
    tagsList: '',
    postsList: `<p>共 ${sortedTags.length} 个标签，${posts.length} 篇文章</p>${tagsCloudParts.join("")}`,
  };
  const renderedContent = renderTemplate(tagsLayout, contentData);

  const tagsIndexTitle = `Tags - ${config.site.title}`;
  const tagsIndexDescription = buildMetaDescription({
    title: "Tags",
    primary: `Browse all tags and discover posts on ${config.site.title}`,
    fallbackText: config.site.description,
    siteDescription: config.site.description,
  });

  const output = renderPage(baseLayout, {
    route: `/${urlPrefix}/tag`,
    title: tagsIndexTitle,
    description: tagsIndexDescription,
    content: renderedContent,
    css: css || "",
    ogTags: { title: tagsIndexTitle, description: tagsIndexDescription, url: `${config.site.url}/${urlPrefix}/tag`, type: "website", siteName: config.site.title },
    jsonLd: { type: "CollectionPage", title: tagsIndexTitle, description: tagsIndexDescription, url: `${config.site.url}/${urlPrefix}/tag`, numberOfItems: sortedTags.length },
    year,
  });

  const outputPath = join(config.dirs.dist, urlPrefix, "tag", "index.html");
  await ensureDir(dirname(outputPath));
  await writeFileContent(outputPath, output);
  console.log(`✓ Built /${urlPrefix}/tag -> ${outputPath}`);
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

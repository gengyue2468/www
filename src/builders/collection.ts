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
import { buildMetaDescription, generateKeywords } from "../utils/seo.js";
import { AppError, ErrorCode, isENOENT, errorReporter } from "../utils/errors.js";
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

function collectAllTags(posts: Post[]): string[] {
  const allTags: string[] = [];
  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) allTags.push(...post.tags);
  }
  return allTags;
}

function sortPostsByDate<T extends { date?: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
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

async function loadPostsFromDir(
  srcDir: string,
  cacheManager?: BuildCacheManager
): Promise<PostWithContent[]> {
  const posts: PostWithContent[] = [];

  let files: string[];
  try {
    files = await readdir(srcDir);
  } catch (err) {
    if (isENOENT(err)) {
      errorReporter.reportWarning(`Content directory not found: ${srcDir}`);
      return posts;
    }
    throw AppError.fromError(err, ErrorCode.FILE_READ_ERROR, { dir: srcDir });
  }

  const mdFiles = files.filter(file => extname(file) === ".md");

  const postPromises = mdFiles.map(async (file) => {
    const filePath = join(srcDir, file);

    let changed = true;
    if (cacheManager) {
      changed = await cacheManager.hasChanged("blogPosts", filePath, filePath);
    }

    const slug = basename(file, ".md");
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
      changed,
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
  css: string,
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

  return renderPage(baseLayout, {
    route: `/${urlPrefix}`,
    title: indexTitle,
    description: indexDescription,
    content: renderedContent,
    css: css || "",
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
}

async function buildPostPages(
  posts: PostWithContent[],
  coll: CollectionConfig,
  urlPrefix: string,
  baseLayout: string,
  postLayout: string,
  css: string,
  year?: number,
  cacheManager?: BuildCacheManager,
  hooks?: BuildHooks
): Promise<void> {
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
      ? `<a href="/${urlPrefix}/${post.slug}.md" class="md-link" rel="nofollow">.md</a>`
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
        publishedTime: frontmatter.date as string,
        modifiedTime: (frontmatter.updated as string) || undefined,
        authorName: config.site.author,
      },
      jsonLd: {
        type: "BlogPosting",
        title,
        description,
        url: `${config.site.url}/${urlPrefix}/${post.slug}`,
        date: frontmatter.date as string,
        dateModified: (frontmatter.updated as string) || undefined,
        tags: postTags,
      },
      breadcrumbs: [
        { name: config.site.title, url: config.site.url },
        { name: capitalize(coll.name), url: `${config.site.url}/${urlPrefix}` },
        { name: title, url: `${config.site.url}/${urlPrefix}/${post.slug}` },
      ],
      year,
    });

    output = await applyAfterHooks(hooks, "post", post.slug, output);

    const outputPath = join(config.dirs.dist, urlPrefix, post.slug, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFileContent(outputPath, output);

    if (cacheManager) {
      await cacheManager.updateMtime("blogPosts", post.filePath, post.filePath);
    }

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
  css: string,
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

  const anyPostChanged = posts.some(p => p.changed);
  const allTagsGlobal = collectAllTags(posts);

  const tagPromises: Promise<void>[] = [];

  for (const [tag, taggedPosts] of tagMap) {
    tagPromises.push((async () => {
      const slug = getTagSlug(tag);

      if (!anyPostChanged && !taggedPosts.some(p => p.changed)) {
        console.log(`  (cached) /${urlPrefix}/tag/${slug}`);
        return;
      }

      const sortedPosts = sortPostsByDate(taggedPosts);

      const tagNavHtml = generateTagsHTML(allTagsGlobal, urlPrefix);
      const postsListHtml = generatePostsListHTML(sortedPosts, urlPrefix);

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
      });

      const outputPath = join(config.dirs.dist, urlPrefix, "tag", slug, "index.html");
      await ensureDir(dirname(outputPath));
      await writeFileContent(outputPath, output);
      console.log(`✓ Built /${urlPrefix}/tag/${slug}`);
    })());
  }

  await Promise.all(tagPromises);

  if (!anyPostChanged) {
    console.log(`  (cached) /${urlPrefix}/tag`);
    return;
  }

  const allTags = collectAllTags(posts);
  if (allTags.length === 0) return;

  const tagsCloudHtml = generateTagsHTML(allTags, urlPrefix);
  const uniqueTagCount = new Set(allTags).size;

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

  const output = renderPage(baseLayout, {
    route: `/${urlPrefix}/tag`,
    title: tagsIndexTitle,
    description: tagsIndexDescription,
    content: renderedContent,
    css: css || "",
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
  });

  const outputPath = join(config.dirs.dist, urlPrefix, "tag", "index.html");
  await ensureDir(dirname(outputPath));
  await writeFileContent(outputPath, output);
  console.log(`✓ Built /${urlPrefix}/tag -> ${outputPath}`);
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

  const posts = await loadPostsFromDir(srcDir, cacheManager);

  if (indexLayout) {
    const output = buildCollectionIndex(posts, coll, urlPrefix, baseLayout, indexLayout, css || "", year);
    const outputPath = join(config.dirs.dist, urlPrefix, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFileContent(outputPath, output);
    console.log(`✓ Built /${urlPrefix} -> ${outputPath}`);
  }

  if (postLayout) {
    await buildPostPages(posts, coll, urlPrefix, baseLayout, postLayout, css || "", year, cacheManager, hooks);
  }

  if (coll.tags && tagsLayout) {
    await buildTagPages(posts, coll, urlPrefix, baseLayout, tagsLayout, css || "", year);
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

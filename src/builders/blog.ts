import { join, dirname, extname, basename } from "path";
import { readdir } from "fs/promises";
import { ensureDir, writeFileContent } from "../utils/fs.js";
import { renderMarkdown } from "../utils/markdown.js";
import { renderTemplate, renderNav } from "../utils/template.js";
import { formatDate } from "../utils/date.js";
import { hasMermaidCode as checkMermaidCode, mermaidScript } from "../extensions/mermaid.js";
import config from "../config.js";
import type { Post } from "../types.js";

// Extended post with pre-rendered content
interface PostWithContent extends Post {
  html: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
}

/**
 * Truncate description to optimal length for SEO (150 chars)
 */
function truncateDescription(description: string, maxLength = 150): string {
  if (description.length <= maxLength) return description;
  // Find the last sentence or phrase boundary before maxLength
  const truncated = description.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf("。");
  const lastSpace = truncated.lastIndexOf(" ");
  const cutoff = lastPeriod > 0 ? lastPeriod + 1 : (lastSpace > 0 ? lastSpace : maxLength);
  return truncated.substring(0, cutoff) + "...";
}

/**
 * Generate keywords meta tag from tags array
 */
function generateKeywords(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "";
  const keywords = tags.join(", ");
  return `<meta name="keywords" content="${keywords}" />`;
}

/**
 * Generate Open Graph meta tags
 */
function generateOgTags(
  title: string,
  description: string,
  url: string,
  type: string,
  tags?: string[]
): string {
  const parts: string[] = [
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${truncateDescription(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${config.site.title}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${truncateDescription(description)}" />`,
  ];

  if (tags && tags.length > 0) {
    parts.push(`<meta name="twitter:label1" content="标签" />`);
    parts.push(`<meta name="twitter:data1" content="${tags.slice(0, 3).join(", ")}" />`);
  }

  return parts.join("\n    ");
}

/**
 * Generate JSON-LD structured data for blog posts
 */
function generateJsonLd(
  title: string,
  description: string,
  url: string,
  date: string | undefined,
  tags: string[] | undefined
): string {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: truncateDescription(description),
    url: url,
    author: {
      "@type": "Person",
      name: config.site.author,
    },
    publisher: {
      "@type": "Person",
      name: config.site.author,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (date) {
    data.datePublished = new Date(date).toISOString();
  }

  if (tags && tags.length > 0) {
    data.keywords = tags.join(", ");
  }

  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
}

/**
 * URL-safe tag slug generator
 * Converts tag names to URL-friendly slugs
 */
function getTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-") // Keep Chinese characters, convert others to hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from ends
}

/**
 * Generate tags HTML with links using array join for better performance
 */
function generateTagsHTML(allTags: string[]): string {
  const tagCounts: Record<string, number> = {};
  for (const tag of allTags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }

  // Sort by count descending, then alphabetically
  const sortedTags = [...new Set(allTags)].sort((a, b) => {
    const countDiff = tagCounts[b] - tagCounts[a];
    return countDiff !== 0 ? countDiff : a.localeCompare(b);
  });

  const parts: string[] = ['<div class="tags-list">'];
  for (const tag of sortedTags) {
    const slug = getTagSlug(tag);
    const count = tagCounts[tag];
    // Size based on count (min 1, max 3)
    const size = Math.min(3, Math.max(1, Math.ceil(count / 2)));
    parts.push(`<a href="/blog/tag/${slug}" class="tag tag-size-${size}" data-count="${count}">#${tag} <span class="tag-count">(${count})</span></a>`);
  }
  parts.push("</div>");
  return parts.join("");
}

/**
 * Generate post tags HTML with links using array join
 */
function generatePostTagsHTML(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return "";
  const parts: string[] = ['<div class="post-tags" style="margin-top: 2rem; margin-bottom: 1rem;">'];
  for (const tag of tags) {
    const slug = getTagSlug(tag);
    parts.push(`<a href="/blog/tag/${slug}" class="tag">#${tag}</a>`);
  }
  parts.push("</div>");
  return parts.join("");
}

/**
 * Generate posts list HTML using array join for better performance
 */
function generatePostsListHTML(posts: Post[]): string {
  if (posts.length === 0) return "<p>No posts found.</p>";

  // Group posts by year
  const postsByYear: Record<string, Post[]> = {};
  for (const post of posts) {
    if (post.date) {
      const year = new Date(post.date).getFullYear().toString();
      if (!postsByYear[year]) {
        postsByYear[year] = [];
      }
      postsByYear[year].push(post);
    } else {
      if (!postsByYear[""]) {
        postsByYear[""] = [];
      }
      postsByYear[""].push(post);
    }
  }

  // Get sorted years (descending)
  const years = Object.keys(postsByYear).sort((a, b) => {
    if (a === "") return 1;
    if (b === "") return -1;
    return parseInt(b) - parseInt(a);
  });

  const parts: string[] = [];
  for (const year of years) {
    const yearPosts = postsByYear[year];
    if (year) {
      parts.push(`<h3>${year}</h3>`);
    }
    parts.push('<ul class="posts-list">');
    for (const post of yearPosts) {
      parts.push(`<li class="post-item">`);
      parts.push(`<a href="/blog/${post.slug}">${post.title}</a>`);
      if (post.date) {
        const formattedDate = formatDate(post.date);
        parts.push(` <span class="post-date-inline">${formattedDate}</span>`);
      }
      parts.push("</li>");
    }
    parts.push("</ul>");
  }
  return parts.join("");
}

/**
 * Build blog index - now returns posts with pre-rendered content for reuse
 */
export async function buildBlogIndex(
  baseLayout: string,
  blogIndexLayout: string,
  year?: number,
  css?: string
): Promise<PostWithContent[]> {
  const blogDir = config.dirs.blog;
  const posts: PostWithContent[] = [];

  try {
    const files = await readdir(blogDir);
    const mdFiles = files.filter(file => extname(file) === ".md");

    // Process all markdown files in parallel
    const postPromises = mdFiles.map(async (file) => {
      const filePath = join(blogDir, file);
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
      };
    });

    const results = await Promise.all(postPromises);
    posts.push(...results);
  } catch {
    // Blog directory doesn't exist
  }

  // Sort posts by date
  posts.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Generate tags HTML
  const allTags: string[] = [];
  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) {
      allTags.push(...post.tags);
    }
  }

  const tagsHtml = generateTagsHTML(allTags);
  const postsListHtml = posts.length > 0 ? generatePostsListHTML(posts) : "<p>No posts yet.</p>";
  const tagsSection = `<div style="margin-top: 3rem;">${tagsHtml}</div>`;

  const contentData = { title: "Blog", postsList: postsListHtml + tagsSection };
  const renderedContent = renderTemplate(blogIndexLayout, contentData);

  const blogUrl = `${config.site.url}/blog`;
  const baseData = {
    title: "Blog",
    siteTitle: config.site.title,
    description: truncateDescription(config.site.description),
    author: config.site.author,
    year: year?.toString() || new Date().getFullYear().toString(),
    content: renderedContent,
    css: css || "",
    nav: renderNav(config.nav),
    scripts: "",
    footerLlms: config.llms?.enabled ? ' | <a href="/llms.txt">llms.txt</a>' : '',
    canonicalUrl: blogUrl,
    keywords: "",
    ogTags: generateOgTags("Blog", config.site.description, blogUrl, "website"),
    jsonLd: "",
  };
  const output = renderTemplate(baseLayout, baseData);

  const outputPath = join(config.dirs.dist, "blog", "index.html");
  await ensureDir(dirname(outputPath));
  await writeFileContent(outputPath, output);
  console.log(`✓ Built /blog -> ${outputPath}`);

  return posts;
}

/**
 * Build individual blog post pages - now receives pre-rendered content
 * Processes posts in parallel for maximum performance
 */
export async function buildBlogPosts(
  posts: PostWithContent[],
  baseLayout: string,
  blogPostLayout: string,
  year?: number,
  css?: string
): Promise<void> {
  // Build all posts in parallel
  const buildPromises = posts.map(async (post, i) => {
    const { html, frontmatter } = post;
    const title = (frontmatter.title as string) || post.slug;

    const formattedDate = formatDate(frontmatter.date as string);

    // Determine prev/next posts
    const prevPost = i > 0 ? posts[i - 1] : null;
    const nextPost = i < posts.length - 1 ? posts[i + 1] : null;

    // Build navigation HTML using array join
    let navHtml = "";
    if (prevPost || nextPost) {
      const navParts: string[] = [`<nav class="post-nav">`];
      if (prevPost) {
        navParts.push(`<a href="/blog/${prevPost.slug}">← ${prevPost.title}</a>`);
      }
      if (nextPost) {
        navParts.push(`<a href="/blog/${nextPost.slug}">${nextPost.title} →</a>`);
      }
      navParts.push("</nav>");
      navHtml = navParts.join("");
    }

    const postTagsHtml = generatePostTagsHTML(frontmatter.tags as string[]);
    const dateClass = formattedDate ? "" : " hidden";

    // Calculate word count (Chinese characters + English words)
    const plainText = html.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
    const wordCountNum = plainText.length;
    const wordCount = `${wordCountNum} 字`;

    // Markdown source link in post date line
    const sourceMdLink = config.llms?.enabled
      ? `<a href="/blog/${post.slug}.md" class="md-link">.md</a>`
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
    const renderedContent = renderTemplate(blogPostLayout, contentData);

    const description = (frontmatter.summary as string) || config.site.description;
    const hasMermaid = html.includes('class="mermaid"') || checkMermaidCode(html);
    const scripts = hasMermaid ? mermaidScript : "";

    const postUrl = `${config.site.url}/blog/${post.slug}`;
    const postTags = frontmatter.tags as string[] | undefined;

    const baseData = {
      title,
      siteTitle: config.site.title,
      description: truncateDescription(description),
      author: config.site.author,
      year: year?.toString() || new Date().getFullYear().toString(),
      content: renderedContent,
      css: css || "",
      nav: renderNav(config.nav),
      scripts,
      footerLlms: config.llms?.enabled ? ' | <a href="/llms.txt">llms.txt</a>' : '',
      canonicalUrl: postUrl,
      keywords: generateKeywords(postTags),
      ogTags: generateOgTags(title, description, postUrl, "article", postTags),
      jsonLd: generateJsonLd(title, description, postUrl, frontmatter.date as string, postTags),
    };
    const output = renderTemplate(baseLayout, baseData);

    const outputPath = join(config.dirs.dist, "blog", post.slug, "index.html");
    await ensureDir(dirname(outputPath));
    await writeFileContent(outputPath, output);
    console.log(`✓ Built /blog/${post.slug}`);
  });

  // Wait for all posts to be built in parallel
  await Promise.all(buildPromises);
}

/**
 * Build tag pages - generates a page for each unique tag
 * Shows all posts with that tag, grouped by year
 */
export async function buildTagPages(
  posts: PostWithContent[],
  baseLayout: string,
  tagsLayout: string,
  year?: number,
  css?: string
): Promise<void> {
  // Build tag index - map of tag -> posts
  const tagMap = new Map<string, Post[]>();

  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        const existing = tagMap.get(tag) || [];
        existing.push(post);
        tagMap.set(tag, existing);
      }
    }
  }

  if (tagMap.size === 0) return;

  // Build all tag pages in parallel
  const tagPromises: Promise<void>[] = [];

  for (const [tag, taggedPosts] of tagMap) {
    const promise = (async () => {
      const slug = getTagSlug(tag);

      // Sort posts by date (newest first)
      taggedPosts.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Generate all tags list for navigation (mark current tag as active)
      const allTags: string[] = [];
      for (const post of posts) {
        if (post.tags && Array.isArray(post.tags)) {
          allTags.push(...post.tags);
        }
      }

      // Use same tag list format as blog index
      const tagNavHtml = generateTagsHTML(allTags);

      // Generate posts list
      const postsListHtml = generatePostsListHTML(taggedPosts);

      const contentData = {
        title: `Tag: #${tag}`,
        tagsList: tagNavHtml,
        postsList: postsListHtml,
      };
      const renderedContent = renderTemplate(tagsLayout, contentData);

      const tagUrl = `${config.site.url}/blog/tag/${slug}`;
      const tagDescription = `标签 "${tag}" 下的所有文章 - ${config.site.title}`;

      const baseData = {
        title: `Tag: #${tag}`,
        siteTitle: config.site.title,
        description: truncateDescription(tagDescription),
        author: config.site.author,
        year: year?.toString() || new Date().getFullYear().toString(),
        content: renderedContent,
        css: css || "",
        nav: renderNav(config.nav),
        scripts: "",
        footerLlms: config.llms?.enabled ? ' | <a href="/llms.txt">llms.txt</a>' : '',
        canonicalUrl: tagUrl,
        keywords: generateKeywords([tag]),
        ogTags: generateOgTags(`Tag: #${tag}`, tagDescription, tagUrl, "website", [tag]),
        jsonLd: "",
      };
      const output = renderTemplate(baseLayout, baseData);

      const outputPath = join(config.dirs.dist, "blog", "tag", slug, "index.html");
      await ensureDir(dirname(outputPath));
      await writeFileContent(outputPath, output);
      console.log(`✓ Built /blog/tag/${slug}`);
    })();

    tagPromises.push(promise);
  }

  // Wait for all tag pages to be built
  await Promise.all(tagPromises);

  // Build tag index page (list of all tags)
  await buildTagIndexPage(posts, baseLayout, tagsLayout, year, css);
}

/**
 * Build the tag index page (/blog/tag/)
 */
async function buildTagIndexPage(
  posts: PostWithContent[],
  baseLayout: string,
  tagsLayout: string,
  year?: number,
  css?: string
): Promise<void> {
  // Collect all tags with counts
  const allTags: string[] = [];
  for (const post of posts) {
    if (post.tags && Array.isArray(post.tags)) {
      allTags.push(...post.tags);
    }
  }

  if (allTags.length === 0) return;

  const tagCounts: Record<string, number> = {};
  for (const tag of allTags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }

  const sortedTags = [...new Set(allTags)].sort((a, b) => {
    const countDiff = tagCounts[b] - tagCounts[a];
    return countDiff !== 0 ? countDiff : a.localeCompare(b);
  });

  // Build tag cloud/list
  const tagsListParts: string[] = ['<div class="tags-cloud">'];
  for (const tag of sortedTags) {
    const slug = getTagSlug(tag);
    const count = tagCounts[tag];
    // Size based on count (min 1, max 3)
    const size = Math.min(3, Math.max(1, Math.ceil(count / 2)));
    tagsListParts.push(`<a href="/blog/tag/${slug}" class="tag tag-size-${size}" data-count="${count}">#${tag} <span class="tag-count">(${count})</span></a>`);
  }
  tagsListParts.push('</div>');
  const tagsCloudHtml = tagsListParts.join("");

  const contentData = {
    title: "All Tags",
    tagsList: '',
    postsList: `<p>共 ${sortedTags.length} 个标签，${posts.length} 篇文章</p>${tagsCloudHtml}`,
  };
  const renderedContent = renderTemplate(tagsLayout, contentData);

  const tagsIndexUrl = `${config.site.url}/blog/tag`;
  const tagsIndexDescription = `浏览所有文章标签 - ${config.site.title}`;

  const baseData = {
    title: "All Tags",
    siteTitle: config.site.title,
    description: truncateDescription(tagsIndexDescription),
    author: config.site.author,
    year: year?.toString() || new Date().getFullYear().toString(),
    content: renderedContent,
    css: css || "",
    nav: renderNav(config.nav),
    scripts: "",
    footerLlms: config.llms?.enabled ? ' | <a href="/llms.txt">llms.txt</a>' : '',
    canonicalUrl: tagsIndexUrl,
    keywords: "",
    ogTags: generateOgTags("All Tags", tagsIndexDescription, tagsIndexUrl, "website"),
    jsonLd: "",
  };
  const output = renderTemplate(baseLayout, baseData);

  const outputPath = join(config.dirs.dist, "blog", "tag", "index.html");
  await ensureDir(dirname(outputPath));
  await writeFileContent(outputPath, output);
  console.log(`✓ Built /blog/tag -> ${outputPath}`);
}

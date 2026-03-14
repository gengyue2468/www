export interface BlogMeta {
  title: string
  date: string
  summary?: string
  tags?: string[]
}

export interface BlogPost extends BlogMeta {
  slug: string
  content: string
}

export interface BlogPostMonthGroup {
  month: string
  posts: BlogPost[]
}

export interface BlogPostYearGroup {
  year: string
  months: BlogPostMonthGroup[]
}

function parseFrontmatter(raw: string): { meta: Partial<BlogMeta>; body: string } {
  const trimmed = raw.trimStart()
  if (!trimmed.startsWith('---')) {
    return { meta: {}, body: raw }
  }

  const end = trimmed.indexOf('\n---', 3)
  if (end === -1) {
    return { meta: {}, body: raw }
  }

  const fmBlock = trimmed.slice(3, end).trimEnd()
  const body = trimmed.slice(end + 4).trimStart()

  const meta: Partial<BlogMeta> = {}

  const lines = fmBlock.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) continue

    const match = /^([A-Za-z0-9_-]+)\s*:(.*)$/.exec(line)
    if (!match) continue

    const key = match[1].trim() as keyof BlogMeta
    let rest = match[2].trim()

    if (key === 'tags') {
      const tags: string[] = []

      if (rest && rest !== '[]') {
        // 行内数组：tags: ['a','b'] 或 tags: [a, b]
        let inner = rest
        if (inner.startsWith('[') && inner.endsWith(']')) {
          inner = inner.slice(1, -1)
        }
        inner
          .split(/[，,]/)
          .map((p) => p.trim())
          .forEach((p) => {
            if (!p) return
            let t = p
            if (
              (t.startsWith("'") && t.endsWith("'")) ||
              (t.startsWith('"') && t.endsWith('"'))
            ) {
              t = t.slice(1, -1)
            }
            if (t) tags.push(t)
          })
      } else {
        // 多行 YAML：tags: \n  - a \n  - b
        let j = i + 1
        while (j < lines.length) {
          const l2 = lines[j].trim()
          if (!l2) {
            j++
            continue
          }
          if (!l2.startsWith('-')) break
          let tag = l2.slice(1).trim()
          if (
            (tag.startsWith("'") && tag.endsWith("'")) ||
            (tag.startsWith('"') && tag.endsWith('"'))
          ) {
            tag = tag.slice(1, -1)
          }
          if (tag) tags.push(tag)
          j++
        }
        i = j - 1
      }

      if (tags.length) {
        meta.tags = tags
      }
      continue
    }

    let value = rest
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1)
    }

    ;(meta as any)[key] = value
  }

  return { meta, body }
}

// For Astro, we need to use import.meta.glob differently
// This will be populated at build time
let allPosts: BlogPost[] = []
let blogInitPromise: Promise<void> | null = null

export function initBlogPosts(modules: Record<string, string>) {
  allPosts = Object.entries(modules).map(([path, raw]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const { meta, body } = parseFrontmatter(raw)

    return {
      slug,
      title: meta.title ?? slug,
      date: meta.date ?? '',
      summary: meta.summary,
      tags: meta.tags ?? [],
      content: body,
    }
  })

  allPosts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export async function ensureBlogPostsInitialized(): Promise<void> {
  if (allPosts.length > 0) return

  if (!blogInitPromise) {
    blogInitPromise = (async () => {
      const blogModules = import.meta.glob('../contents/blog/*.md', {
        query: '?raw',
        import: 'default',
      })

      const modules: Record<string, string> = {}
      for (const [path, loader] of Object.entries(blogModules)) {
        modules[path] = (await loader()) as string
      }

      initBlogPosts(modules)
    })()
  }

  await blogInitPromise
}

export function getAllPosts(): BlogPost[] {
  return allPosts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug)
}

export function getAdjacentPosts(slug: string): { prev: BlogPost | null; next: BlogPost | null } {
  const index = allPosts.findIndex((p) => p.slug === slug)
  if (index === -1) return { prev: null, next: null }

  return {
    prev: index < allPosts.length - 1 ? allPosts[index + 1] : null,
    next: index > 0 ? allPosts[index - 1] : null,
  }
}

export function getPostsByTag(tag: string): BlogPost[] {
  return allPosts.filter((p) => p.tags?.includes(tag))
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  allPosts.forEach((p) => {
    p.tags?.forEach((t) => tagSet.add(t))
  })
  return Array.from(tagSet).sort()
}

export function groupPostsByYearMonth(posts: BlogPost[]): BlogPostYearGroup[] {
  const yearMap = new Map<string, Map<string, BlogPost[]>>()

  for (const post of posts) {
    const [year = '?', month = '01'] = post.date.split('-')
    if (!yearMap.has(year)) yearMap.set(year, new Map())
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) monthMap.set(month, [])
    monthMap.get(month)!.push(post)
  }

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, groupedPosts]) => ({ month, posts: groupedPosts })),
    }))
}

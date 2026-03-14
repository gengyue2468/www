import MarkdownIt from 'markdown-it'

export interface PageFrontmatter {
  title?: string
  description?: string
  summary?: string
  eyebrow?: string
  [key: string]: any
}

export interface TocItem {
  id: string
  text: string
  level: 2 | 3 | 4
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#96;/g, '`')
    .replace(/&amp;/g, '&')
}

function stripHtml(text: string): string {
  return decodeHtmlEntities(text.replace(/<[^>]+>/g, ''))
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\u00A0]+/g, '-')
    .replace(/["'`~!@#$%^&*()+=[\]{}|\\:;,.<>/?]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parsePageFrontmatter(raw: string): { frontmatter: PageFrontmatter; body: string } {
  const trimmed = raw.trimStart()
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, body: raw }
  }

  const end = trimmed.indexOf('\n---', 3)
  if (end === -1) {
    return { frontmatter: {}, body: raw }
  }

  const fmBlock = trimmed.slice(3, end).trimEnd()
  const body = trimmed.slice(end + 4).trimStart()

  const frontmatter: PageFrontmatter = {}
  const lines = fmBlock.split('\n')

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    const match = /^([A-Za-z0-9_-]+)\s*:(.*)$/.exec(trimmedLine)
    if (!match) continue

    const key = match[1].trim()
    let value = match[2].trim()

    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1)
    }

    frontmatter[key] = value
  }

  return { frontmatter, body }
}

const mdSidenote = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})
function findMatchingBracket(text: string, start: number): number {
  let count = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '[') count++
    else if (text[i] === ']') count--
    if (count === 0) return i
  }
  return -1
}

function parseNestedSidenotes(text: string): string {
  let result = ''
  let i = 0

  while (i < text.length) {
    const bracketStart = text.indexOf('[', i)

    if (bracketStart === -1) {
      result += text.slice(i)
      break
    }

    result += text.slice(i, bracketStart)

    const afterBracket = text.slice(bracketStart + 1)
    const isNote = afterBracket.startsWith('note:')
    const isFootnote = afterBracket.startsWith('^')

    if (!isNote && !isFootnote) {
      result += '['
      i = bracketStart + 1
      continue
    }

    const bracketEnd = findMatchingBracket(text, bracketStart)
    if (bracketEnd === -1) {
      result += '['
      i = bracketStart + 1
      continue
    }

    const inner = text.slice(bracketStart + 1, bracketEnd)
    let content: string

    if (isNote) {
      content = inner.slice(5)
    } else {
      content = inner.slice(1)
    }

    const parsedContent = parseNestedSidenotes(content.trim())

    const rendered = mdSidenote.render(parsedContent)
    const cleanRendered = rendered
      .replace(/^<p>|<\/p>\n?$/g, '')
      .trim()

    result += `<span class="sidenote">${cleanRendered}</span>`

    i = bracketEnd + 1
  }

  return result
}

function preprocessSidenotes(src: string): string {
  return parseNestedSidenotes(src)
}

function preprocessFoldBlocks(src: string): string {
  const foldPattern = /^[ \t]*\[fold:(.+?)\][ \t]*\r?\n([\s\S]*?)^[ \t]*\[\/fold\][ \t]*$/gm

  return src.replace(foldPattern, (_, rawTitle: string, rawContent: string) => {
    const title = escapeHtml(rawTitle.trim())
    const content = rawContent.trim()

    return `<details class="custom-fold">\n<summary>${title}</summary>\n\n${content}\n\n</details>`
  })
}

function addHeadingIds(html: string): string {
  const usedIds = new Set<string>()

  return html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/g, (full, level, attrs, inner) => {
    if (/\sid=/.test(attrs)) {
      return full
    }

    const text = stripHtml(inner).trim()
    if (!text) {
      return full
    }

    const baseId = slugifyHeading(text) || 'section'
    let id = baseId
    let suffix = 2

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }

    usedIds.add(id)
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`
  })
}

function transformMermaidBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => `<div class="mermaid">${decodeHtmlEntities(code).trim()}</div>`,
  )
}

export function extractTocFromHtml(html: string): TocItem[] {
  const toc: TocItem[] = []

  html.replace(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/g, (_, levelRaw, attrs, inner) => {
    const idMatch = /\sid="([^"]+)"/.exec(attrs)
    if (!idMatch) return ''

    const text = stripHtml(inner).trim()
    if (!text) return ''

    const level = Number(levelRaw) as 2 | 3 | 4
    toc.push({
      id: idMatch[1],
      text,
      level,
    })

    return ''
  })

  return toc
}

export function renderMarkdown(raw: string): string {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
  })

  let src = raw
  src = preprocessFoldBlocks(src)
  src = preprocessSidenotes(src)

  const rendered = md.render(src)
  return transformMermaidBlocks(addHeadingIds(rendered))
}

import type { Post, Page } from './types.js'

export function parseFrontmatter(raw: string): { metadata: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { metadata: {}, content: raw }
  }

  const metadata: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx !== -1) {
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      metadata[key] = value
    }
  }

  return { metadata, content: match[2].trim() }
}

function toPost(filename: string, raw: string): Post {
  const slug = filename.replace(/^.*\/posts\//, '').replace('.md', '')
  const { metadata, content } = parseFrontmatter(raw)
  const dates = (metadata.date ?? '').split(',').map((d) => d.trim()).filter(Boolean)
  return {
    slug,
    title: metadata.title ?? slug,
    date: dates[0] ?? '',
    dates,
    description: metadata.description ?? '',
    image: metadata.image,
    content,
  }
}

function toPage(filename: string, raw: string): Page {
  const slug = filename.replace(/^.*\/pages\//, '').replace('.md', '')
  const { metadata, content } = parseFrontmatter(raw)
  return {
    slug,
    title: metadata.title ?? slug,
    uri: metadata.uri ?? `/${slug}`,
    position: metadata.position !== undefined ? parseInt(metadata.position, 10) : undefined,
    image: metadata.image,
    content,
  }
}

export function parsePosts(modules: Record<string, string>): Post[] {
  return Object.entries(modules)
    .map(([filename, raw]) => toPost(filename, raw))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function parsePages(modules: Record<string, string>): Page[] {
  const pages = Object.entries(modules)
    .map(([filename, raw]) => toPage(filename, raw))

  const withPosition = pages.filter((p) => p.position !== undefined).sort((a, b) => a.position! - b.position!)
  const withoutPosition = pages.filter((p) => p.position === undefined).sort((a, b) => a.title.localeCompare(b.title))

  return [...withPosition, ...withoutPosition]
}

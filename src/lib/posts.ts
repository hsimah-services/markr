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
  return {
    slug,
    title: metadata.title ?? slug,
    date: metadata.date ?? '',
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
  return Object.entries(modules)
    .map(([filename, raw]) => toPage(filename, raw))
}

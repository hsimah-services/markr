import type { ResolvedConfig, Post, Page } from '../lib/types.js'

let _config: ResolvedConfig | null = null

export function setConfig(config: ResolvedConfig): void {
  _config = config
}

export function getConfig(): ResolvedConfig {
  if (!_config) {
    throw new Error('markr: config not initialized. Did you call createApp()?')
  }
  return _config
}

export function getAllPosts(): Post[] {
  return getConfig().posts
}

export function getPostBySlug(slug: string): Post | undefined {
  return getConfig().posts.find((p) => p.slug === slug)
}

export function getPage(slug: string): Page | undefined {
  return getConfig().pages.find((p) => p.slug === slug)
}

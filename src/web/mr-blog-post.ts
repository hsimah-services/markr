import { escapeHtml } from '../lib/html.js'
import { getPostBySlug, getConfig } from '../runtime/config.js'
import type { MrMarkdownRenderer } from './mr-markdown-renderer.js'

export class MrBlogPost extends HTMLElement {
  connectedCallback() {
    this.render()
  }

  private render() {
    const route = window.location.pathname
    const slug = route.slice(1).split('/').at(1) ?? ''

    const post = getPostBySlug(slug)
    if (!post) {
      this.innerHTML = `
        <div class="not-found">
          <h1>Post not found</h1>
          <a href="/">
            Back to home
          </a>
        </div>`
      return
    }

    const imageHtml = post.image
      ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" class="post-image" />`
      : ''

    const repoUrl = getConfig().repoUrl
    const historyUrl = repoUrl ? `${repoUrl}/commits/main/posts/${encodeURIComponent(post.slug)}.md` : null

    const formatDate = (date: string) =>
      historyUrl
        ? `<a href="${escapeHtml(historyUrl)}" class="post-date-link">${escapeHtml(date)}</a>`
        : escapeHtml(date)

    const publishedHtml = `<time class="post-meta">Published: ${formatDate(post.dates[0] ?? post.date)}</time>`
    const updatedHtml =
      post.dates.length > 1
        ? `<time class="post-meta">Updated: ${formatDate(post.dates[post.dates.length - 1])}</time>`
        : ''

    this.innerHTML = `
      <article>
        ${imageHtml}
        <header class="post-header">
          <h1 class="post-title">${escapeHtml(post.title)}</h1>
          ${publishedHtml}
          ${updatedHtml}
        </header>
        <mr-markdown-renderer></mr-markdown-renderer>
      </article>
    `

    const renderer = this.querySelector<MrMarkdownRenderer>('mr-markdown-renderer')!
    renderer.setContent(post.content)
  }
}

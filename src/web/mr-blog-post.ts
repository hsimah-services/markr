import { escapeHtml } from '../lib/html.js'
import { getPostBySlug } from '../runtime/config.js'
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

    this.innerHTML = `
      <article>
        ${imageHtml}
        <header class="post-header">
          <h1 class="post-title">${escapeHtml(post.title)}</h1>
          <time class="post-meta">${escapeHtml(post.date)}</time>
        </header>
        <mr-markdown-renderer></mr-markdown-renderer>
      </article>
    `

    const renderer = this.querySelector<MrMarkdownRenderer>('mr-markdown-renderer')!
    renderer.setContent(post.content)
  }
}

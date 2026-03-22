import { escapeHtml } from '../lib/html.js'
import { getPage } from '../runtime/config.js'
import type { MrMarkdownRenderer } from './mr-markdown-renderer.js'

export class MrPage extends HTMLElement {
  static observedAttributes = ['slug']

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  private render() {
    const slug = this.getAttribute('slug')
    if (!slug) {
      this.innerHTML = '<p>Page not found.</p>'
      return
    }

    const page = getPage(slug)
    if (!page) {
      this.innerHTML = '<p>Page not found.</p>'
      return
    }

    const { title, image, content } = page

    const imageHtml = image
      ? `<div class="page-image-container">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="page-image" />
        </div>`
      : ''

    this.innerHTML = `
      <article class="page">
        ${imageHtml}
        <mr-markdown-renderer></mr-markdown-renderer>
      </article>
    `

    const renderer = this.querySelector<MrMarkdownRenderer>('mr-markdown-renderer')!
    renderer.setContent(content)
  }
}

import { escapeHtml } from '../lib/html.js'
import { getPage } from '../runtime/config.js'
import type { MrMarkdownRenderer } from './mr-markdown-renderer.js'

export class MrAbout extends HTMLElement {
  connectedCallback() {
    this.render()
  }

  private render() {
    const page = getPage('about')
    if (!page) {
      this.innerHTML = '<p>About page not found.</p>'
      return
    }

    const { title, image, content } = page

    const imageHtml = image
      ? `<div class="about-image-container">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="about-image" />
        </div>`
      : ''

    this.innerHTML = `
      <article class="about">
        ${imageHtml}
        <mr-markdown-renderer></mr-markdown-renderer>
      </article>
    `

    const renderer = this.querySelector<MrMarkdownRenderer>('mr-markdown-renderer')!
    renderer.setContent(content)
  }
}

import { escapeHtml } from '../lib/html.js'

export class MrCard extends HTMLElement {
  static observedAttributes = ['card-title', 'card-date', 'card-description']

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  private render() {
    const title = this.getAttribute('card-title') ?? ''
    const date = this.getAttribute('card-date') ?? ''
    const description = this.getAttribute('card-description') ?? ''

    this.innerHTML = `
      <div class="card feed-card">
        <div class="card-header">
          <h3 class="card-title">${escapeHtml(title)}</h3>
          <time class="feed-date">${escapeHtml(date)}</time>
        </div>
        <div class="card-content">
          <p class="card-description">${escapeHtml(description)}</p>
        </div>
      </div>
    `
  }
}

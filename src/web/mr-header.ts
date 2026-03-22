import { escapeHtml } from '../lib/html.js'
import { getConfig } from '../runtime/config.js'

export class MrHeader extends HTMLElement {
  static observedAttributes = ['current-path']

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  private render() {
    const config = getConfig()
    const currentPath = this.getAttribute('current-path') ?? '/'
    const homeClass = currentPath === '/' ? 'nav-link--active' : 'nav-link--inactive'
    const aboutClass = currentPath.startsWith('/about') ? 'nav-link--active' : 'nav-link--inactive'

    this.innerHTML = `
      <header class="header">
        <div class="header-inner">
          <div class="header-content">
            <a href="/" class="header-logo">${escapeHtml(config.title)}</a>
            <nav class="header-nav">
              <a href="/" class="nav-link ${escapeHtml(homeClass)}">Home</a>
              <a href="/about" class="nav-link ${escapeHtml(aboutClass)}">About</a>
            </nav>
          </div>
        </div>
      </header>
    `
  }
}

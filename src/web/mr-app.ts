import { getConfig } from '../runtime/config.js'

export class MrApp extends HTMLElement {
  private main!: HTMLElement

  connectedCallback() {
    this.innerHTML = `
      <div class="layout">
        <mr-header current-path="${window.location.pathname}"></mr-header>
        <main class="layout-main"></main>
      </div>
    `
    this.main = this.querySelector('main')!

    this.renderContent()

    window.addEventListener('popstate', this.renderContent)
    this.addEventListener('click', this.handleClick)
  }

  private renderContent = () => {
    const path = window.location.pathname

    const header = this.querySelector('mr-header')
    header?.setAttribute('current-path', path)

    if (path.startsWith('/posts/')) {
      this.main.innerHTML = '<mr-blog-post></mr-blog-post>'
      return
    }

    const config = getConfig()
    const matchedPage = config.pages.find((p) => p.uri === path)
    if (matchedPage) {
      this.main.innerHTML = `<mr-page slug="${matchedPage.slug}"></mr-page>`
      return
    }

    this.main.innerHTML = '<mr-feed></mr-feed>'
  }

  private handleClick = (e: MouseEvent) => {
    if (e.defaultPrevented) return
    if (e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

    const anchor = (e.target as Element).closest('a')
    if (!anchor) return
    if (anchor.hasAttribute('target')) return
    if (anchor.hasAttribute('download')) return

    const url = new URL(anchor.href, window.location.origin)
    if (url.origin !== window.location.origin) return

    e.preventDefault()
    history.pushState(null, '', url.pathname)
    this.renderContent()
  }
}

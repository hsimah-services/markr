import { escapeHtml } from '../lib/html.js'
import { getConfig } from '../runtime/config.js'

const MOON_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`

const SUN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`

function isDarkActive(): boolean {
  const root = document.documentElement
  if (root.classList.contains('markr-dark')) return true
  if (root.classList.contains('markr-light')) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export class MrHeader extends HTMLElement {
  static observedAttributes = ['current-path']

  private _mediaQuery: MediaQueryList | null = null
  private _mediaHandler: (() => void) | null = null

  connectedCallback() {
    this.render()
    const config = getConfig()
    if (!config.theme) {
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this._mediaHandler = () => {
        if (!localStorage.getItem('markr-theme')) {
          this.render()
        }
      }
      this._mediaQuery.addEventListener('change', this._mediaHandler)
    }
  }

  disconnectedCallback() {
    if (this._mediaQuery && this._mediaHandler) {
      this._mediaQuery.removeEventListener('change', this._mediaHandler)
    }
  }

  attributeChangedCallback() {
    this.render()
  }

  private render() {
    const config = getConfig()
    const currentPath = this.getAttribute('current-path') ?? '/'
    const homeClass = currentPath === '/' ? 'nav-link--active' : 'nav-link--inactive'
    const aboutClass = currentPath.startsWith('/about') ? 'nav-link--active' : 'nav-link--inactive'

    const dark = isDarkActive()
    const icon = dark ? SUN_ICON : MOON_ICON
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode'
    const showToggle = !config.theme

    this.innerHTML = `
      <header class="header">
        <div class="header-inner">
          <div class="header-content">
            <a href="/" class="header-logo">${escapeHtml(config.title)}</a>
            <nav class="header-nav">
              <a href="/" class="nav-link ${escapeHtml(homeClass)}">Home</a>
              <a href="/about" class="nav-link ${escapeHtml(aboutClass)}">About</a>
              ${showToggle ? `<button class="theme-toggle" aria-label="${label}" title="${label}">${icon}</button>` : ''}
            </nav>
          </div>
        </div>
      </header>
    `

    if (showToggle) {
      this.querySelector('.theme-toggle')!.addEventListener('click', () => {
        this._toggleTheme()
      })
    }
  }

  private _toggleTheme() {
    const root = document.documentElement
    const dark = isDarkActive()

    if (dark) {
      root.classList.remove('markr-dark')
      root.classList.add('markr-light')
      localStorage.setItem('markr-theme', 'light')
    } else {
      root.classList.remove('markr-light')
      root.classList.add('markr-dark')
      localStorage.setItem('markr-theme', 'dark')
    }

    this.render()
  }
}

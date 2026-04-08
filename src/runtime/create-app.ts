import type { MarkrConfig } from '../lib/types.js'
import { parsePosts, parsePages } from '../lib/posts.js'
import { setConfig } from './config.js'
import { registerComponents } from '../web/register.js'
import { DEFAULT_COLORS, DEFAULT_DARK_COLORS, camelToKebab } from '../lib/colors.js'

interface CreateAppOptions extends MarkrConfig {
  posts: Record<string, string>
  pages: Record<string, string>
}

function injectTheme(options: CreateAppOptions): void {
  const root = document.documentElement

  root.style.setProperty('--font-sans', `"${options.fonts.sans.family}", sans-serif`)
  root.style.setProperty('--font-mono', `"${options.fonts.mono.family}", monospace`)
  root.style.setProperty('--font-serif', `"${options.fonts.serif.family}", serif`)

  const lightColors = { ...DEFAULT_COLORS, ...options.colors }
  let lightCSS = ':root {\n'
  for (const [key, value] of Object.entries(lightColors)) {
    lightCSS += `  --color-${camelToKebab(key)}: ${value};\n`
  }
  lightCSS += '}\n'

  let lightForceCSS = ':root.markr-light {\n'
  for (const [key, value] of Object.entries(lightColors)) {
    lightForceCSS += `  --color-${camelToKebab(key)}: ${value};\n`
  }
  lightForceCSS += '}\n'

  const darkColors = { ...DEFAULT_DARK_COLORS, ...options.darkColors }
  let darkCSS = ':root.markr-dark {\n'
  for (const [key, value] of Object.entries(darkColors)) {
    darkCSS += `  --color-${camelToKebab(key)}: ${value};\n`
  }
  darkCSS += '}\n'

  let darkMediaCSS = `@media (prefers-color-scheme: dark) {\n  :root:not(.markr-light) {\n`
  for (const [key, value] of Object.entries(darkColors)) {
    darkMediaCSS += `    --color-${camelToKebab(key)}: ${value};\n`
  }
  darkMediaCSS += '  }\n}\n'

  const style = document.createElement('style')
  style.setAttribute('data-markr-theme', '')
  style.textContent = lightCSS + lightForceCSS + darkCSS + darkMediaCSS
  document.head.appendChild(style)
}

export function createApp(options: CreateAppOptions): void {
  const posts = parsePosts(options.posts)
  const pages = parsePages(options.pages)

  const resolvedColors = { ...DEFAULT_COLORS, ...options.colors }
  const resolvedDarkColors = { ...DEFAULT_DARK_COLORS, ...options.darkColors }

  setConfig({
    title: options.title,
    repoUrl: options.repoUrl,
    fonts: options.fonts,
    colors: resolvedColors,
    darkColors: resolvedDarkColors,
    theme: options.theme,
    posts,
    pages,
  })

  if (options.theme === 'dark') {
    document.documentElement.classList.add('markr-dark')
    document.documentElement.classList.remove('markr-light')
  } else if (options.theme === 'light') {
    document.documentElement.classList.add('markr-light')
    document.documentElement.classList.remove('markr-dark')
  } else {
    const savedTheme = localStorage.getItem('markr-theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('markr-dark')
      document.documentElement.classList.remove('markr-light')
    } else if (savedTheme === 'light') {
      document.documentElement.classList.add('markr-light')
      document.documentElement.classList.remove('markr-dark')
    }
  }

  injectTheme(options)
  registerComponents()
}

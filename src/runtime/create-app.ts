import type { MarkrConfig, ColorConfig, DarkColorConfig } from '../lib/types.js'
import { parsePosts, parsePages } from '../lib/posts.js'
import { setConfig } from './config.js'
import { registerComponents } from '../web/register.js'

const DEFAULT_COLORS: Required<ColorConfig> = {
  background: 'oklch(0.9885 0.0057 84.5659)',
  foreground: 'oklch(0.366 0.0251 49.6085)',
  card: 'oklch(0.9686 0.0091 78.2818)',
  cardForeground: 'oklch(0.366 0.0251 49.6085)',
  primary: 'oklch(0.5553 0.1455 48.9975)',
  primaryForeground: 'oklch(1 0 0)',
  secondary: 'oklch(0.8276 0.0752 74.44)',
  secondaryForeground: 'oklch(0.4444 0.0096 73.639)',
  muted: 'oklch(0.9363 0.0218 83.2637)',
  mutedForeground: 'oklch(0.5534 0.0116 58.0708)',
  accent: 'oklch(0.9 0.05 74.9889)',
  accentForeground: 'oklch(0.4444 0.0096 73.639)',
  border: 'oklch(0.8866 0.0404 89.6994)',
  ring: 'oklch(0.5553 0.1455 48.9975)',
}

const DEFAULT_DARK_COLORS: Required<DarkColorConfig> = {
  background: 'oklch(0.2161 0.0061 56.0434)',
  foreground: 'oklch(0.9699 0.0013 106.4238)',
  card: 'oklch(0.2685 0.0063 34.2976)',
  cardForeground: 'oklch(0.9699 0.0013 106.4238)',
  primary: 'oklch(0.7049 0.1867 47.6044)',
  primaryForeground: 'oklch(1 0 0)',
  secondary: 'oklch(0.4444 0.0096 73.639)',
  secondaryForeground: 'oklch(0.9232 0.0026 48.7171)',
  muted: 'oklch(0.233 0.0073 67.4563)',
  mutedForeground: 'oklch(0.7161 0.0091 56.259)',
  accent: 'oklch(0.3598 0.0497 229.3202)',
  accentForeground: 'oklch(0.9232 0.0026 48.7171)',
  border: 'oklch(0.3741 0.0087 67.5582)',
  ring: 'oklch(0.7049 0.1867 47.6044)',
}

interface CreateAppOptions extends MarkrConfig {
  posts: Record<string, string>
  pages: Record<string, string>
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
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

import { marked } from 'marked'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parsePosts, parsePages } from '../lib/posts.js'
import { parseConfigFromSource } from '../lib/config-parser.js'
import { escapeHtml } from '../lib/html.js'
import { DEFAULT_COLORS, DEFAULT_DARK_COLORS, camelToKebab } from '../lib/colors.js'
import type { MarkrConfig, Post, Page } from '../lib/types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface PrerenderOptions {
  root?: string
  outDir?: string
}

export async function prerender(options?: PrerenderOptions): Promise<void> {
  const root = resolve(options?.root ?? process.cwd())
  const outDir = resolve(root, options?.outDir ?? 'dist')

  const config = readConfig(root)
  const posts = readPosts(root)
  const pages = readPages(root)

  const baseCss = readFileSync(resolve(__dirname, '..', 'styles', 'base.css'), 'utf-8')
  const themeCss = generateThemeCss(config)

  const routes: Route[] = [
    { path: '/', type: 'feed' },
    ...posts.map((p) => ({ path: `/posts/${p.slug}`, type: 'post' as const, post: p })),
    ...pages.map((p) => ({ path: p.uri, type: 'page' as const, page: p })),
  ]

  for (const route of routes) {
    const html = renderRoute(config, posts, pages, baseCss, themeCss, route)
    const filePath =
      route.path === '/'
        ? resolve(outDir, 'index.html')
        : resolve(outDir, route.path.replace(/^\//, ''), 'index.html')
    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, html)
  }

  console.log(`Prerender complete → ${routes.length} pages written to ${outDir}`)
}

type Route =
  | { path: string; type: 'feed' }
  | { path: string; type: 'post'; post: Post }
  | { path: string; type: 'page'; page: Page }

function readConfig(root: string): MarkrConfig {
  const configPath = resolve(root, 'markr.config.ts')
  try {
    const raw = readFileSync(configPath, 'utf-8')
    return parseConfigFromSource(raw)
  } catch {
    throw new Error(
      `markr prerender: Could not read markr.config.ts at ${configPath}. ` +
        'Make sure you have a markr.config.ts in your project root.'
    )
  }
}

function readPosts(root: string): Post[] {
  const postsDir = resolve(root, 'posts')
  if (!existsSync(postsDir)) return []
  const modules: Record<string, string> = {}
  for (const file of readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
    modules[`/posts/${file}`] = readFileSync(resolve(postsDir, file), 'utf-8')
  }
  return parsePosts(modules)
}

function readPages(root: string): Page[] {
  const pagesDir = resolve(root, 'pages')
  if (!existsSync(pagesDir)) return []
  const modules: Record<string, string> = {}
  for (const file of readdirSync(pagesDir).filter((f) => f.endsWith('.md'))) {
    modules[`/pages/${file}`] = readFileSync(resolve(pagesDir, file), 'utf-8')
  }
  return parsePages(modules)
}

function generateThemeCss(config: MarkrConfig): string {
  const lightColors = { ...DEFAULT_COLORS, ...config.colors }
  const darkColors = { ...DEFAULT_DARK_COLORS, ...config.darkColors }

  let css = ':root {\n'
  for (const [key, value] of Object.entries(lightColors)) {
    css += `  --color-${camelToKebab(key)}: ${value};\n`
  }
  css += '}\n'

  css += ':root.markr-light {\n'
  for (const [key, value] of Object.entries(lightColors)) {
    css += `  --color-${camelToKebab(key)}: ${value};\n`
  }
  css += '}\n'

  css += ':root.markr-dark {\n'
  for (const [key, value] of Object.entries(darkColors)) {
    css += `  --color-${camelToKebab(key)}: ${value};\n`
  }
  css += '}\n'

  css += `@media (prefers-color-scheme: dark) {\n  :root:not(.markr-light) {\n`
  for (const [key, value] of Object.entries(darkColors)) {
    css += `    --color-${camelToKebab(key)}: ${value};\n`
  }
  css += '  }\n}\n'

  return css
}

function renderRoute(
  config: MarkrConfig,
  posts: Post[],
  pages: Page[],
  baseCss: string,
  themeCss: string,
  route: Route
): string {
  const fontLinks = [config.fonts.sans, config.fonts.mono, config.fonts.serif]
    .map((font) => `    <link href="${font.url}" rel="stylesheet" />`)
    .join('\n')

  const fontCss = [
    `--font-sans: "${config.fonts.sans.family}", sans-serif`,
    `--font-mono: "${config.fonts.mono.family}", monospace`,
    `--font-serif: "${config.fonts.serif.family}", serif`,
  ].join('; ')

  const headerHtml = renderHeader(config, pages, route.path)
  const contentHtml = renderContent(config, posts, route)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
${fontLinks}
  <link rel="icon" type="image/svg+xml" href="/assets/favicon-light.svg" media="(prefers-color-scheme: light)" />
  <link rel="icon" type="image/svg+xml" href="/assets/favicon-dark.svg" media="(prefers-color-scheme: dark)" />
  <title>${escapeHtml(config.title)}</title>
  <style>${baseCss}</style>
  <style data-markr-theme>:root { ${fontCss} }\n${themeCss}</style>
</head>
<body>
  <div class="layout">
    ${headerHtml}
    <main class="layout-main">
      ${contentHtml}
    </main>
  </div>
</body>
</html>`
}

function renderHeader(config: MarkrConfig, pages: Page[], currentPath: string): string {
  const homeClass = currentPath === '/' ? 'nav-link--active' : 'nav-link--inactive'

  const pageLinks = pages
    .map((page) => {
      const activeClass = currentPath === page.uri ? 'nav-link--active' : 'nav-link--inactive'
      return `<a href="${escapeHtml(page.uri)}" class="nav-link ${activeClass}">${escapeHtml(page.title)}</a>`
    })
    .join('\n              ')

  return `
        <header class="header">
          <div class="header-inner">
            <div class="header-content">
              <a href="/" class="header-logo">${escapeHtml(config.title)}</a>
              <nav class="header-nav">
                <a href="/" class="nav-link ${homeClass}">Home</a>
                ${pageLinks}
              </nav>
            </div>
          </div>
        </header>`
}

function renderContent(config: MarkrConfig, posts: Post[], route: Route): string {
  switch (route.type) {
    case 'feed':
      return renderFeed(posts)
    case 'post':
      return renderPost(config, route.post)
    case 'page':
      return renderPageContent(route.page)
  }
}

function renderFeed(posts: Post[]): string {
  if (posts.length === 0) {
    return '<p class="feed-empty">No posts yet.</p>'
  }

  const cards = posts
    .map(
      (post) => `
          <a href="/posts/${escapeHtml(post.slug)}" class="feed-link">
            <div class="card feed-card">
              <div class="card-header">
                <h3 class="card-title">${escapeHtml(post.title)}</h3>
                <time class="feed-date">${escapeHtml(post.dates[post.dates.length - 1] ?? post.date)}</time>
              </div>
              <div class="card-content">
                <p class="card-description">${escapeHtml(post.description)}</p>
              </div>
            </div>
          </a>`
    )
    .join('')

  return `<div class="feed">${cards}
        </div>`
}

function renderPost(config: MarkrConfig, post: Post): string {
  const imageHtml = post.image
    ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" class="post-image" />`
    : ''

  const repoUrl = config.repoUrl
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

  const contentHtml = marked.parse(post.content) as string

  return `<article>
          ${imageHtml}
          <header class="post-header">
            <h1 class="post-title">${escapeHtml(post.title)}</h1>
            ${publishedHtml}
            ${updatedHtml}
          </header>
          <div class="prose">${contentHtml}</div>
        </article>`
}

function renderPageContent(page: Page): string {
  const imageHtml = page.image
    ? `<div class="page-image-container">
          <img src="${escapeHtml(page.image)}" alt="${escapeHtml(page.title)}" class="page-image" />
        </div>`
    : ''

  const contentHtml = marked.parse(page.content) as string

  return `<article class="page">
          ${imageHtml}
          <div class="prose">${contentHtml}</div>
        </article>`
}

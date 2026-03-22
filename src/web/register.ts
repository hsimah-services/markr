import { MrApp } from './mr-app.js'
import { MrHeader } from './mr-header.js'
import { MrCard } from './mr-card.js'
import { MrFeed } from './mr-feed.js'
import { MrMarkdownRenderer } from './mr-markdown-renderer.js'
import { MrBlogPost } from './mr-blog-post.js'
import { MrPage } from './mr-page.js'

export function registerComponents(): void {
  customElements.define('mr-markdown-renderer', MrMarkdownRenderer)
  customElements.define('mr-header', MrHeader)
  customElements.define('mr-card', MrCard)
  customElements.define('mr-feed', MrFeed)
  customElements.define('mr-blog-post', MrBlogPost)
  customElements.define('mr-page', MrPage)
  customElements.define('mr-app', MrApp)
}

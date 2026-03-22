import { escapeHtml } from '../lib/html.js'
import { getAllPosts } from '../runtime/config.js'

export class MrFeed extends HTMLElement {
  connectedCallback() {
    this.render()
  }

  private render() {
    const posts = getAllPosts()
    if (posts.length === 0) {
      this.innerHTML = '<p class="feed-empty">No posts yet.</p>'
      return
    }

    this.innerHTML = `
      <div class="feed">
        ${posts
          .map(
            (post) => `
          <a href="/posts/${escapeHtml(post.slug)}" class="feed-link">
            <mr-card
              card-title="${escapeHtml(post.title)}"
              card-date="${escapeHtml(post.date)}"
              card-description="${escapeHtml(post.description)}"
            ></mr-card>
          </a>
        `
          )
          .join('')}
      </div>
    `
  }
}

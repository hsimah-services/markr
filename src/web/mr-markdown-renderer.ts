import { marked } from 'marked'

export class MrMarkdownRenderer extends HTMLElement {
  setContent(markdown: string) {
    const html = marked.parse(markdown) as string
    this.innerHTML = `<div class="prose">${html}</div>`
  }
}

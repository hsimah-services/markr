# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Type-check (tsc -b) then build with Vite
npm run dev          # Build in watch mode (vite build --watch)
```

No test runner or linter is configured.

## Architecture

markr is a package that provides a Vite plugin and a browser runtime for repo-based microblogging. Consumers install `markr`, add a `markr.config.ts` + `vite.config.ts`, and write markdown files in `posts/` and `pages/` directories.

### Three entry points

- **`markr`** (`src/index.ts` → `dist/index.js`) — Browser runtime. Exports `createApp()` and `defineConfig()`.
- **`markr/vite`** (`src/plugin/index.ts` → `dist/plugin/index.js`) — Vite plugin. Generates virtual modules and serves HTML.
- **`markr/prerender`** (`src/prerender/index.ts` → `dist/prerender/index.js`) — Node.js prerenderer. Exports `prerender()` which reads markdown files directly from disk and writes static `index.html` files per route. No web components — pure HTML with inlined CSS.

### How it works end-to-end

1. **Plugin reads config** — `parseConfigFromSource()` reads `markr.config.ts` as raw text, strips TS syntax with regex, and evaluates the object literal with `new Function`. It does not use TS compilation.
2. **Plugin generates HTML** — In build mode, writes `index.html` to project root (cleaned up in `closeBundle`). In dev, a post-middleware serves generated HTML for all non-file routes (SPA fallback).
3. **Virtual entry module** (`virtual:markr/entry`) — Generated code that imports `base.css`, the consumer's config, globs `posts/*.md` and `pages/*.md` via `import.meta.glob`, and calls `createApp()`.
4. **Virtual CSS module** (`virtual:markr/base.css`) — Resolves to `dist/styles/base.css` (copied there by a custom plugin in `vite.config.ts`).
5. **`createApp()`** — Parses markdown frontmatter, resolves color themes with defaults, injects CSS custom properties, and registers all `mr-*` web components.
6. **`<mr-app>`** — Client-side router using `pushState`/`popstate`. Routes to `<mr-feed>` (home), `<mr-blog-post>` (post detail), or `<mr-page>` (static page).

### Key directories

- `src/web/` — Custom elements (`mr-app`, `mr-header`, `mr-card`, `mr-feed`, `mr-blog-post`, `mr-page`, `mr-markdown-renderer`)
- `src/runtime/` — `createApp()` and config singleton
- `src/lib/` — Shared utilities: frontmatter parsing (`posts.ts`), types (`types.ts`), HTML escaping (`html.ts`), color defaults + `camelToKebab` (`colors.ts`), config parser (`config-parser.ts`)
- `src/plugin/` — Vite plugin and HTML template generation
- `src/prerender/` — Static HTML renderer (`prerender()` function)
- `src/styles/base.css` — Base stylesheet (copied to `dist/styles/` at build time, not bundled into JS)

### Markdown frontmatter

Posts (`posts/*.md`) support: `title`, `description`, `date` (comma-separated for multiple dates — first is published, last is updated), `image`.

Pages (`pages/*.md`) support: `title`, `uri` (defaults to `/<slug>`), `position` (sort order), `image`.

### Important conventions

- Web components are prefixed `mr-` and registered via `customElements.define()`.
- `appType: 'custom'` is required so Vite doesn't expect an `index.html` in dev mode.
- Virtual module IDs use the `\0` prefix convention for resolved IDs.
- `import.meta.glob` paths in the virtual entry use `/` prefix to resolve from the consumer's project root.
- `__dirname` in built plugin/prerender code resolves to `dist/plugin/` or `dist/prerender/`, so CSS path resolution uses `resolve(__dirname, '..', 'styles', 'base.css')`.
- Colors use oklch format. Theme injection creates CSS custom properties on `:root`. Defaults live in `src/lib/colors.ts` and are shared by both `create-app.ts` (runtime) and `prerender/index.ts`.
- `parseConfigFromSource()` in `src/lib/config-parser.ts` is shared by the Vite plugin and the prerenderer. It strips TS syntax with regex and evals with `new Function` — it does not compile TypeScript.

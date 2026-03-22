# markr

Markr is a repo-based microblogging platform. Posts are simply checked into the git repo as markdown files (with yaml-style frontmatter).

## Getting Started

### Install

```bash
npm install markr
```

### Project Structure

A markr microblog needs three things: a config file, a Vite config, and content files.

```
my-blog/
  markr.config.ts
  vite.config.ts
  posts/
    hello-world.md
    second-post.md
  pages/
    about.md
  assets/
    favicon-light.svg
    favicon-dark.svg
  package.json
```

### Configuration

Create a `markr.config.ts` in your project root:

```ts
import { defineConfig } from 'markr'

export default defineConfig({
  title: 'My Blog',
  fonts: {
    sans: {
      family: 'Inter',
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    },
    mono: {
      family: 'Fira Code',
      url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap',
    },
    serif: {
      family: 'Merriweather',
      url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    },
  },
})
```

#### Config Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `title` | `string` | Yes | The title of your blog |
| `fonts` | `{ sans, mono, serif }` | Yes | Font configuration (each needs `family` and `url`) |
| `colors` | `ColorConfig` | No | Custom light mode colors |
| `darkColors` | `DarkColorConfig` | No | Custom dark mode colors |
| `theme` | `'light' \| 'dark'` | No | Force a specific theme (defaults to system preference) |

### Vite Config

Create a `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import markr from 'markr/vite'

export default defineConfig({
  plugins: [markr()],
})
```

### Writing Posts

Create markdown files in the `posts/` directory. Each post uses YAML frontmatter:

```md
---
title: Hello World
date: 2025-01-15
description: My first post
image: https://example.com/image.jpg
---

Your markdown content here.
```

| Frontmatter | Required | Description |
|-------------|----------|-------------|
| `title` | No | Post title (defaults to filename) |
| `date` | No | Publication date (used for sorting, newest first) |
| `description` | No | Short description |
| `image` | No | Image URL |

### Writing Pages

Create markdown files in the `pages/` directory. Pages appear in the site navigation.

```md
---
title: About
uri: /about
position: 1
---

This is the about page.
```

| Frontmatter | Required | Description |
|-------------|----------|-------------|
| `title` | No | Page title (defaults to filename) |
| `uri` | No | URL path (defaults to `/{slug}`) |
| `position` | No | Navigation order (pages without position are sorted alphabetically after positioned pages) |
| `image` | No | Image URL |

### Running

```bash
# Development
npx vite

# Build
npx vite build
```

### Customizing Colors

Pass `colors` and `darkColors` to override the default theme. Each accepts the following keys:

`background`, `foreground`, `card`, `cardForeground`, `primary`, `primaryForeground`, `secondary`, `secondaryForeground`, `muted`, `mutedForeground`, `accent`, `accentForeground`, `border`, `ring`

```ts
export default defineConfig({
  title: 'My Blog',
  fonts: { /* ... */ },
  colors: {
    primary: 'oklch(0.6 0.15 250)',
    background: 'oklch(0.98 0.01 250)',
  },
  darkColors: {
    primary: 'oklch(0.7 0.15 250)',
    background: 'oklch(0.2 0.01 250)',
  },
})
```

### Favicons

Place `favicon-light.svg` and `favicon-dark.svg` in the `assets/` directory at your project root. These are used for light and dark mode respectively.

import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateHtml } from './html-template.js'
import type { MarkrConfig } from '../lib/types.js'

const VIRTUAL_ENTRY_ID = 'virtual:markr/entry'
const RESOLVED_VIRTUAL_ENTRY_ID = '\0' + VIRTUAL_ENTRY_ID

const __dirname = dirname(fileURLToPath(import.meta.url))

export default function markrPlugin(): Plugin {
  let config: MarkrConfig
  let projectRoot: string
  let generatedHtmlPath: string | null = null

  return {
    name: 'markr',
    enforce: 'pre',

    config(userConfig, { command }) {
      // Read markr.config.ts from the project root
      projectRoot = userConfig.root ? resolve(userConfig.root) : process.cwd()
      const configPath = resolve(projectRoot, 'markr.config.ts')
      try {
        const raw = readFileSync(configPath, 'utf-8')
        config = parseConfigFromSource(raw)
      } catch {
        throw new Error(
          `markr: Could not read markr.config.ts at ${configPath}. ` +
          'Make sure you have a markr.config.ts in your project root.'
        )
      }

      if (command === 'build') {
        // Write index.html to project root for Vite to use as entry
        generatedHtmlPath = resolve(projectRoot, 'index.html')
        writeFileSync(generatedHtmlPath, generateHtml(config))
      }

      return {
        appType: 'custom',
      }
    },

    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.headers.accept?.includes('text/html')) {
            const html = generateHtml(config)
            server.transformIndexHtml(req.url, html).then((transformed) => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'text/html')
              res.end(transformed)
            }).catch(next)
            return
          }
          next()
        })
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_ENTRY_ID) {
        return RESOLVED_VIRTUAL_ENTRY_ID
      }
      if (id === 'virtual:markr/base.css') {
        return resolve(__dirname, '..', 'styles', 'base.css')
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ENTRY_ID) {
        return generateVirtualEntry()
      }
    },

    closeBundle() {
      if (generatedHtmlPath) {
        try {
          unlinkSync(generatedHtmlPath)
        } catch {
          // ignore if already removed
        }
        generatedHtmlPath = null
      }
    },
  }
}

function generateVirtualEntry(): string {
  return `
import 'virtual:markr/base.css'
import { createApp } from 'markr'
import config from '/markr.config'

const postModules = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default', eager: true })
const pageModules = import.meta.glob('/pages/*.md', { query: '?raw', import: 'default', eager: true })

createApp({ ...config, posts: postModules, pages: pageModules })
`
}

function parseConfigFromSource(source: string): MarkrConfig {
  const cleaned = source
    .replace(/import\s+.*?from\s+['"].*?['"]\s*;?\n?/g, '')
    .replace(/export\s+default\s+/, '')
    .replace(/defineConfig\s*\(\s*/, '')
    .replace(/\)\s*;?\s*$/, '')

  try {
    const fn = new Function(`return (${cleaned})`)
    return fn() as MarkrConfig
  } catch {
    throw new Error('markr: Could not parse markr.config.ts. Ensure it exports a plain object via defineConfig().')
  }
}

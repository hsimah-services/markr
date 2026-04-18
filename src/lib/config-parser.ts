import type { MarkrConfig } from './types.js'

export function parseConfigFromSource(source: string): MarkrConfig {
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

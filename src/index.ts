export { createApp } from './runtime/create-app.js'
export type { MarkrConfig, FontConfig, ColorConfig, DarkColorConfig, Post, Page } from './lib/types.js'

export function defineConfig(config: import('./lib/types.js').MarkrConfig): import('./lib/types.js').MarkrConfig {
  return config
}

import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({ rollupTypes: false }),
    {
      name: 'copy-css',
      closeBundle() {
        mkdirSync(resolve(__dirname, 'dist/styles'), { recursive: true })
        copyFileSync(
          resolve(__dirname, 'src/styles/base.css'),
          resolve(__dirname, 'dist/styles/base.css')
        )
      },
    },
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'plugin/index': resolve(__dirname, 'src/plugin/index.ts'),
        'prerender/index': resolve(__dirname, 'src/prerender/index.ts'),
        'prerender/cli': resolve(__dirname, 'src/prerender/cli.ts'),
        'prerender/serve': resolve(__dirname, 'src/prerender/serve.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vite', 'marked', 'node:path', 'node:fs', 'node:url', 'node:child_process'],
    },
    cssCodeSplit: false,
  },
})

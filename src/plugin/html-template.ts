import type { MarkrConfig } from '../lib/types.js'

export function generateHtml(config: MarkrConfig): string {
  const fontLinks = [config.fonts.sans, config.fonts.mono, config.fonts.serif]
    .map((font) => `    <link href="${font.url}" rel="stylesheet" />`)
    .join('\n')

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
  <title>${config.title}</title>
</head>

<body>
  <mr-app>
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh">
      <div style="width:2rem;height:2rem;border:3px solid #e5e7eb;border-top-color:#6b7280;border-radius:50%;animation:mr-spin 0.6s linear infinite"></div>
    </div>
    <style>@keyframes mr-spin{to{transform:rotate(360deg)}}</style>
  </mr-app>
  <script type="module" src="/virtual:markr/entry"></script>
</body>

</html>
`
}

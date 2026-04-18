import type { ColorConfig, DarkColorConfig } from './types.js'

export const DEFAULT_COLORS: Required<ColorConfig> = {
  background: 'oklch(0.9885 0.0057 84.5659)',
  foreground: 'oklch(0.366 0.0251 49.6085)',
  card: 'oklch(0.9686 0.0091 78.2818)',
  cardForeground: 'oklch(0.366 0.0251 49.6085)',
  primary: 'oklch(0.5553 0.1455 48.9975)',
  primaryForeground: 'oklch(1 0 0)',
  secondary: 'oklch(0.8276 0.0752 74.44)',
  secondaryForeground: 'oklch(0.4444 0.0096 73.639)',
  muted: 'oklch(0.9363 0.0218 83.2637)',
  mutedForeground: 'oklch(0.5534 0.0116 58.0708)',
  accent: 'oklch(0.9 0.05 74.9889)',
  accentForeground: 'oklch(0.4444 0.0096 73.639)',
  border: 'oklch(0.8866 0.0404 89.6994)',
  ring: 'oklch(0.5553 0.1455 48.9975)',
}

export const DEFAULT_DARK_COLORS: Required<DarkColorConfig> = {
  background: 'oklch(0.2161 0.0061 56.0434)',
  foreground: 'oklch(0.9699 0.0013 106.4238)',
  card: 'oklch(0.2685 0.0063 34.2976)',
  cardForeground: 'oklch(0.9699 0.0013 106.4238)',
  primary: 'oklch(0.7049 0.1867 47.6044)',
  primaryForeground: 'oklch(1 0 0)',
  secondary: 'oklch(0.4444 0.0096 73.639)',
  secondaryForeground: 'oklch(0.9232 0.0026 48.7171)',
  muted: 'oklch(0.233 0.0073 67.4563)',
  mutedForeground: 'oklch(0.7161 0.0091 56.259)',
  accent: 'oklch(0.3598 0.0497 229.3202)',
  accentForeground: 'oklch(0.9232 0.0026 48.7171)',
  border: 'oklch(0.3741 0.0087 67.5582)',
  ring: 'oklch(0.7049 0.1867 47.6044)',
}

export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

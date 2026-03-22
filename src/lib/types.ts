export interface Post {
  slug: string
  title: string
  date: string
  description: string
  image?: string
  content: string
}

export interface Page {
  slug: string
  title: string
  uri: string
  position?: number
  image?: string
  content: string
}

export interface FontConfig {
  family: string
  url: string
}

export interface ColorConfig {
  background?: string
  foreground?: string
  card?: string
  cardForeground?: string
  primary?: string
  primaryForeground?: string
  secondary?: string
  secondaryForeground?: string
  muted?: string
  mutedForeground?: string
  accent?: string
  accentForeground?: string
  border?: string
  ring?: string
}

export interface DarkColorConfig extends ColorConfig {}

export interface MarkrConfig {
  title: string
  fonts: {
    sans: FontConfig
    mono: FontConfig
    serif: FontConfig
  }
  colors?: ColorConfig
  darkColors?: DarkColorConfig
  theme?: 'light' | 'dark'
}

export interface ResolvedConfig {
  title: string
  fonts: {
    sans: FontConfig
    mono: FontConfig
    serif: FontConfig
  }
  colors: Required<ColorConfig>
  darkColors: Required<DarkColorConfig>
  theme?: 'light' | 'dark'
  posts: Post[]
  pages: Page[]
}

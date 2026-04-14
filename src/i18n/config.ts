export const LOCALES = ['zh', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'zh'

export function isValidLocale(lng: string): lng is Locale {
  return (LOCALES as readonly string[]).includes(lng)
}

import type { Dictionary } from '../types'
import type { Locale } from '../config'

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  zh: () => import('./zh.json').then((m) => m.default as unknown as Dictionary),
  en: () => import('./en.json').then((m) => m.default as unknown as Dictionary),
}

export async function getDictionary(lng: Locale): Promise<Dictionary> {
  return dictionaries[lng]()
}

export interface NavDictionary {
  logo: string
  discover: string
  services: string
  database: string
  subscribe: string
  login: string
  register: string
  searchPlaceholder: string
  // Discover sub-links
  news: string
  newsDesc: string
  explore: string
  exploreDesc: string
  daily: string
  dailyDesc: string
  dailyBadge: string
  // Service operation sub-links
  thinkTank: string
  thinkTankDesc: string
  association: string
  associationDesc: string
  events: string
  eventsDesc: string
  // Service support sub-links
  technology: string
  technologyDesc: string
  fund: string
  fundDesc: string
  // Section labels
  operations: string
  support: string
  // User menu
  dashboard: string
  profile: string
  adminPanel: string
  signOut: string
}

export interface HeroDictionary {
  badge: string
  headline1: string
  headline2: string
  subtitle: string
  subtitleBold1: string
  subtitleBold2: string
  subtitleConnector: string
  subtitleEnd: string
  searchPlaceholder: string
  searchBtn: string
  ctaPrimary: string
  ctaSecondary: string
  stat1Num: string
  stat1Label: string
  stat2Num: string
  stat2Label: string
  stat3Num: string
  stat3Label: string
}

export interface Dictionary {
  nav: NavDictionary
  hero: HeroDictionary
}

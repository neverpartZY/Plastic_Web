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

export interface FeatureCard {
  label: string
  tagline: string
  desc: string
  bullet1: string
  bullet2: string
  bullet3: string
}

export interface FeaturesDictionary {
  badge: string
  title: string
  subtitle: string
  subtitleBold: string
  subtitleEnd: string
  learnMore: string
  ctaQuestion: string
  ctaSubscribe: string
  ctaDatabase: string
  cards: {
    news: FeatureCard
    thinkTank: FeatureCard
    association: FeatureCard
    events: FeatureCard
    technology: FeatureCard
    fund: FeatureCard
  }
}

export interface ModuleEntry {
  label: string
  desc: string
}

export interface SixModulesDictionary {
  badge: string
  title: string
  subtitle: string
  subtitleEnd: string
  tagOperations: string
  tagSupport: string
  connected: string
  bottomHint1: string
  bottomDatabase: string
  bottomHint2: string
  modules: {
    thinkTank: ModuleEntry
    news: ModuleEntry
    association: ModuleEntry
    events: ModuleEntry
    technology: ModuleEntry
    fund: ModuleEntry
  }
}

export interface DataNodeEntry {
  label: string
  tag: string
}

export interface DataEcosystemDictionary {
  badge: string
  title: string
  subtitle: string
  subtitleHighlight: string
  layerTop: string
  layerMid: string
  layerBase: string
  dbTitle: string
  dbBadge: string
  dbDesc: string
  dbStatus: string
  dbStreams: string
  mobileAccumulating: string
  mobileDbDesc: string
  nodes: {
    thinkTank: DataNodeEntry
    news: DataNodeEntry
    events: DataNodeEntry
    association: DataNodeEntry
    technology: DataNodeEntry
    fund: DataNodeEntry
  }
}

export interface FooterDictionary {
  brand: string
  brandDesc: string
  mission: string
  quickNav: string
  hotTags: string
  links: {
    price: string
    policy: string
    recycling: string
    corporate: string
    circular: string
  }
  copyright: string
  tagline: string
}

export interface CommonDictionary {
  learnMore: string
  viewAll: string
  applyNow: string
  registerNow: string
  submitNow: string
  contactUs: string
  close: string
  cancel: string
  confirm: string
  loading: string
  noData: string
  premium: string
  free: string
  verified: string
  new: string
  hot: string
  comingSoon: string
  pages: string
  city: string
  date: string
}

export interface ThinkTankPageDictionary {
  hero: {
    badge: string
    title: string
    subtitle: string
    stat1Num: string
    stat1Label: string
    stat2Num: string
    stat2Label: string
    stat3Num: string
    stat3Label: string
  }
  reportCategories: { whitePaper: string; techGuide: string; compliance: string; market: string }
  actions: { download: string; requestReport: string; expertConsult: string }
  sections: { reports: string; experts: string; research: string }
  tiers: { premium: string; free: string }
}

export interface AssociationPageDictionary {
  hero: {
    badge: string
    title: string
    subtitle: string
    stat1Num: string
    stat1Label: string
    stat2Num: string
    stat2Label: string
    stat3Num: string
    stat3Label: string
  }
  tiers: { director: string; member: string; observer: string }
  perks: {
    director: { p1: string; p2: string; p3: string; p4: string }
    member: { p1: string; p2: string; p3: string; p4: string }
    observer: { p1: string; p2: string; p3: string }
  }
  actions: { join: string; requestReport: string; viewMembers: string }
  sections: { memberTiers: string; memberDirectory: string; reports: string }
  form: {
    name: string
    company: string
    email: string
    phone: string
    applyType: string
    message: string
    submit: string
    namePlaceholder: string
    companyPlaceholder: string
    emailPlaceholder: string
    phonePlaceholder: string
    messagePlaceholder: string
  }
}

export interface EventsPageDictionary {
  hero: {
    badge: string
    title: string
    subtitle: string
    stat1Num: string
    stat1Label: string
    stat2Num: string
    stat2Label: string
    stat3Num: string
    stat3Label: string
  }
  eventTypes: { conference: string; exhibition: string; seminar: string; workshop: string }
  status: { open: string; full: string; closed: string; soon: string }
  actions: { register: string; viewDetails: string; addCalendar: string }
  sections: { upcoming: string; filters: string }
  labels: { capacity: string; registered: string; remaining: string; premium: string; highlight: string }
}

export interface TechnologyPageDictionary {
  hero: {
    badge: string
    title: string
    subtitle: string
    stat1Num: string
    stat1Label: string
    stat2Num: string
    stat2Label: string
    stat3Num: string
    stat3Label: string
  }
  directions: { mechanical: string; chemical: string; enzymatic: string; sorting: string }
  stages: { lab: string; pilot: string; scale: string; commercial: string }
  actions: { joinResearch: string; viewProgress: string; applyFunding: string }
  sections: { directions: string; projects: string; partners: string }
}

export interface FundPageDictionary {
  hero: {
    badge: string
    title: string
    subtitle: string
    stat1Num: string
    stat1Label: string
    stat2Num: string
    stat2Label: string
    stat3Num: string
    stat3Label: string
  }
  stages: { angel: string; preA: string; seriesA: string; seriesB: string }
  focusAreas: { mechanical: string; chemical: string; sorting: string; materials: string }
  actions: { applyFunding: string; viewPortfolio: string; contactFund: string }
  sections: { overview: string; portfolio: string; criteria: string; process: string }
  labels: { aum: string; irr: string; stage: string; focus: string }
}

export interface SubscribePageDictionary {
  hero: { badge: string; title: string; subtitle: string }
  channels: { email: string; wechat: string; feishu: string; whatsapp: string }
  form: {
    name: string
    email: string
    company: string
    channel: string
    submit: string
    namePlaceholder: string
    emailPlaceholder: string
    companyPlaceholder: string
  }
  labels: { hot: string; verified: string; latest: string; freeTrial: string }
}

export interface Dictionary {
  nav: NavDictionary
  hero: HeroDictionary
  features: FeaturesDictionary
  sixModules: SixModulesDictionary
  dataEcosystem: DataEcosystemDictionary
  footer: FooterDictionary
  common: CommonDictionary
  pages: {
    thinkTank: ThinkTankPageDictionary
    association: AssociationPageDictionary
    events: EventsPageDictionary
    technology: TechnologyPageDictionary
    fund: FundPageDictionary
    subscribe: SubscribePageDictionary
  }
}

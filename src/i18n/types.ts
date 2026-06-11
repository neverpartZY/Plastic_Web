export interface NavDictionary {
  logo: string
  intelligence: string    // "情报中心" — first nav group
  intelligenceDesc: string
  dimensions: string      // "八大维度" — second nav group
  services: string        // "服务平台" — third nav group
  database: string
  subscribe: string
  login: string
  register: string
  searchPlaceholder: string
  // Intelligence sub-links
  news: string
  newsDesc: string
  explore: string
  exploreDesc: string
  daily: string
  dailyDesc: string
  dailyBadge: string
  // Eight Dimension sub-links
  molds: string
  moldsDesc: string
  molding: string
  moldingDesc: string
  recycled: string
  recycledDesc: string
  bio: string
  bioDesc: string
  additives: string
  additivesDesc: string
  auxiliaries: string
  auxiliariesDesc: string
  recycling: string
  recyclingDesc: string
  reuse: string
  reuseDesc: string
  // Service sub-links
  thinkTank: string
  thinkTankDesc: string
  association: string
  associationDesc: string
  events: string
  eventsDesc: string
  technology: string
  technologyDesc: string
  fund: string
  fundDesc: string
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
    molds: FeatureCard
    molding: FeatureCard
    recycled: FeatureCard
    bio: FeatureCard
    additives: FeatureCard
    auxiliaries: FeatureCard
    recycling: FeatureCard
    reuse: FeatureCard
  }
}

export interface ModuleEntry {
  label: string
  desc: string
}

export interface EightModulesDictionary {
  badge: string
  title: string
  subtitle: string
  subtitleEnd: string
  tagPrimary: string
  tagSecondary: string
  connected: string
  bottomHint1: string
  bottomDatabase: string
  bottomHint2: string
  modules: {
    molds: ModuleEntry
    molding: ModuleEntry
    recycled: ModuleEntry
    bio: ModuleEntry
    additives: ModuleEntry
    auxiliaries: ModuleEntry
    recycling: ModuleEntry
    reuse: ModuleEntry
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
  layerBottom: string
  layerBase: string
  dbTitle: string
  dbBadge: string
  dbDesc: string
  dbStatus: string
  dbStreams: string
  mobileAccumulating: string
  mobileDbDesc: string
  nodes: {
    molds: DataNodeEntry
    molding: DataNodeEntry
    recycled: DataNodeEntry
    bio: DataNodeEntry
    additives: DataNodeEntry
    auxiliaries: DataNodeEntry
    recycling: DataNodeEntry
    reuse: DataNodeEntry
  }
}

export interface FooterDictionary {
  brand: string
  brandDesc: string
  mission: string
  quickNav: string
  hotTags: string
  links: {
    molds: string
    molding: string
    recycled: string
    bio: string
    additives: string
    auxiliaries: string
    recycling: string
    reuse: string
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
  eightModules: EightModulesDictionary
  dataEcosystem: DataEcosystemDictionary
  footer: FooterDictionary
  common: CommonDictionary
  pages: {
    intelligence: IntelligencePageDictionary
    thinkTank: ThinkTankPageDictionary
    association: AssociationPageDictionary
    events: EventsPageDictionary
    technology: TechnologyPageDictionary
    fund: FundPageDictionary
    subscribe: SubscribePageDictionary
  }
}

export interface IntelligencePageDictionary {
  headerTitle: string
  headerSubtitle: string
  allDimensions: string
  allRegions: string
  hotOnly: string
  hotCount: string
  tabHighlights: string
  tabHighlightsCount: string
  tabAll: string
  empty: string
  prevPage: string
  nextPage: string
  pageInfo: string
  countries: {
    CN: string
    EU: string
    US: string
    UK: string
    GLOBAL: string
  }
}

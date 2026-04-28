/**
 * 站点配置注册表
 * 每个条目对应 CrawlSource 表中的一行，定义了如何抓取该站点。
 * RSS 优先（更稳定）；无 RSS 则用 HTML 选择器。
 */

export type SourceLang     = 'zh' | 'en'
export type SourcePriority = 'p0' | 'p1' | 'p2' | 'p3'
export type ContentType    = 'news' | 'price' | 'policy' | 'standard'

export interface SiteConfig {
  /** 数据库 CrawlSource.name（唯一键，用于 upsert） */
  name: string
  /** 显示给读者的来源名 */
  displayName: string
  baseUrl: string
  lang: SourceLang
  priority: SourcePriority
  contentType: ContentType

  // ── RSS 模式（首选）─────────────────────────────────────────────
  rssUrl?: string

  // ── HTML 模式 ────────────────────────────────────────────────────
  /** 文章列表页 URL */
  listUrl: string
  /** 列表页上提取文章链接的 CSS 选择器 */
  linkSelector: string
  /** 链接过滤函数：返回 true 则纳入 */
  linkFilter: (href: string) => boolean
  /** 文章页正文段落选择器 */
  bodySelector: string
  /** 每次爬取最多处理的文章数 */
  maxArticles: number
}

// ─────────────────────────────────────────────────────────────────
// P0 — 每小时（核心国际媒体）
// ─────────────────────────────────────────────────────────────────

export const SITE_CONFIGS: SiteConfig[] = [
  {
    name: 'plasticstoday',
    displayName: 'PlasticsToday',
    baseUrl: 'https://www.plasticstoday.com',
    lang: 'en',
    priority: 'p0',
    contentType: 'news',
    listUrl: 'https://www.plasticstoday.com/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      h.startsWith('/') &&
      h.length > 5 &&
      !/^\/(topics|search|type|about|advertise|subscribe|login|register|contact|privacy|cookie|terms|tag)\b/.test(h),
    bodySelector: 'article p, .article-body p, .field--name-body p, main p',
    maxArticles: 6,
  },

  {
    name: 'packaging-dive',
    displayName: 'Packaging Dive',
    baseUrl: 'https://www.packagingdive.com',
    lang: 'en',
    priority: 'p0',
    contentType: 'news',
    rssUrl: 'https://www.packagingdive.com/feeds/news/',
    listUrl: 'https://www.packagingdive.com/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.startsWith('/news/') || h.includes('packagingdive.com/news/')) &&
      h.length > 10,
    bodySelector: 'article p, .article__body p, .article-body p',
    maxArticles: 5,
  },

  {
    name: 'resource-recycling',
    displayName: 'Resource Recycling',
    baseUrl: 'https://www.resource-recycling.com',
    lang: 'en',
    priority: 'p0',
    contentType: 'news',
    rssUrl: 'https://resource-recycling.com/recycling/feed/',
    listUrl: 'https://www.resource-recycling.com/plastics/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      h.includes('resource-recycling.com') &&
      /\/(recycling|plastics)\/\d{4}\//.test(h),
    bodySelector: '.entry-content p, .post-content p, article p',
    maxArticles: 5,
  },

  // ── P1 — 每 8 小时 ─────────────────────────────────────────────

  {
    name: 'sustainable-plastics',
    displayName: 'Sustainable Plastics',
    baseUrl: 'https://www.sustainableplastics.com',
    lang: 'en',
    priority: 'p1',
    contentType: 'news',
    listUrl: 'https://www.sustainableplastics.com/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      h.includes('sustainableplastics.com') &&
      /\/(news|article|feature|report)\//.test(h),
    bodySelector: 'article p, .article-body p, .story-body p, .field-items p',
    maxArticles: 5,
  },

  {
    name: 'apr',
    displayName: 'APR',
    baseUrl: 'https://www.plasticsrecycling.org',
    lang: 'en',
    priority: 'p1',
    contentType: 'standard',
    listUrl: 'https://www.plasticsrecycling.org/news-media/news',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.includes('plasticsrecycling.org') || h.startsWith('/')) &&
      /\/(news|media|resources|blog)\//.test(h),
    bodySelector: '.field-body p, .views-field-body p, article p, .content p',
    maxArticles: 4,
  },

  {
    name: 'pre',
    displayName: 'Plastics Recyclers Europe',
    baseUrl: 'https://www.plasticsrecyclers.eu',
    lang: 'en',
    priority: 'p1',
    contentType: 'news',
    listUrl: 'https://www.plasticsrecyclers.eu/news/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.includes('plasticsrecyclers.eu') || h.startsWith('/')) &&
      /\/news\//.test(h) &&
      h.length > 15,
    bodySelector: '.entry-content p, .content p, article p, .field-body p',
    maxArticles: 4,
  },

  {
    name: 'packaging-europe',
    displayName: 'Packaging Europe',
    baseUrl: 'https://www.packagingeurope.com',
    lang: 'en',
    priority: 'p1',
    contentType: 'news',
    listUrl: 'https://www.packagingeurope.com/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      h.includes('packagingeurope.com') &&
      /\/(news|article|feature|exclusive|interview)\//.test(h),
    bodySelector: 'article p, .article-content p, .entry-content p, .post-content p',
    maxArticles: 5,
  },

  {
    name: 'circular-online',
    displayName: 'Circular Online',
    baseUrl: 'https://www.circularonline.co.uk',
    lang: 'en',
    priority: 'p1',
    contentType: 'news',
    rssUrl: 'https://www.circularonline.co.uk/feed/',
    listUrl: 'https://www.circularonline.co.uk/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.startsWith('/') || h.includes('circularonline.co.uk')) &&
      h.length > 10 &&
      !h.includes('#') &&
      !/^\/(category|tag|author|page)\b/.test(h),
    bodySelector: 'article p, .entry-content p, .post-content p',
    maxArticles: 5,
  },

  // ── P2 — 每天 ─────────────────────────────────────────────────

  {
    name: 'recycling-today',
    displayName: 'Recycling Today',
    baseUrl: 'https://www.recyclingtoday.com',
    lang: 'en',
    priority: 'p2',
    contentType: 'news',
    rssUrl: 'https://www.recyclingtoday.com/rss/',
    listUrl: 'https://www.recyclingtoday.com/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.includes('recyclingtoday.com') || h.startsWith('/')) &&
      h.length > 10 &&
      !h.includes('#') &&
      !/^\/(category|tag|author|advertise|subscribe)\b/.test(h),
    bodySelector: 'article p, .article-body p, .story-body p, .content-body p',
    maxArticles: 4,
  },

  {
    name: 'waste-dive',
    displayName: 'Waste Dive',
    baseUrl: 'https://www.wastedive.com',
    lang: 'en',
    priority: 'p2',
    contentType: 'news',
    rssUrl: 'https://www.wastedive.com/feeds/news/',
    listUrl: 'https://www.wastedive.com/news/plastic-recycling/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.includes('wastedive.com/news/') || h.startsWith('/news/')) &&
      h.length > 10,
    bodySelector: 'article p, .article__body p, .article-body p',
    maxArticles: 4,
  },

  {
    name: 'industrysourcing',
    displayName: '荣格工业传媒',
    baseUrl: 'https://www.industrysourcing.cn',
    lang: 'zh',
    priority: 'p2',
    contentType: 'news',
    listUrl: 'https://www.industrysourcing.cn/',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.includes('industrysourcing.cn') || h.startsWith('/')) &&
      /\/(news|article|report)\//i.test(h) &&
      h.length > 10,
    bodySelector: 'article p, .content p, .article-body p, .news-content p',
    maxArticles: 4,
  },

  // ── P3 — 每周 ─────────────────────────────────────────────────

  {
    name: 'ellen-macarthur',
    displayName: 'Ellen MacArthur Foundation',
    baseUrl: 'https://www.ellenmacarthurfoundation.org',
    lang: 'en',
    priority: 'p3',
    contentType: 'standard',
    listUrl: 'https://www.ellenmacarthurfoundation.org/news',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.includes('ellenmacarthurfoundation.org') || h.startsWith('/')) &&
      /\/(news|articles?|insights?|reports?)\//i.test(h) &&
      h.length > 10,
    bodySelector: '.prose p, article p, .content p, .rich-text p',
    maxArticles: 3,
  },

  {
    name: 'circular-economy-eu',
    displayName: 'European Circular Economy Platform',
    baseUrl: 'https://circulareconomy.europa.eu',
    lang: 'en',
    priority: 'p3',
    contentType: 'policy',
    listUrl: 'https://circulareconomy.europa.eu/platform/en/news-and-events/news',
    linkSelector: 'a[href]',
    linkFilter: (h) =>
      (h.includes('circulareconomy.europa.eu') || h.startsWith('/')) &&
      /\/(news|events?)\//.test(h) &&
      h.length > 10,
    bodySelector: '.field-body p, article p, .content p, .text-long p',
    maxArticles: 3,
  },
]

/** 通过 name 快速查找配置 */
export function getSiteConfig(name: string): SiteConfig | undefined {
  return SITE_CONFIGS.find(c => c.name === name)
}

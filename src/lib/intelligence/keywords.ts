/**
 * 7维度关键词矩阵 — 用于内容过滤、分类标注、订阅匹配
 * 每个维度 ≥25 个中英文对照关键词（含行业缩写）
 */

export type Dimension =
  | 'molds'
  | 'molding'
  | 'recycled'
  | 'bio'
  | 'additives'
  | 'auxiliaries'
  | 'recycling'
  | 'reuse'

export interface KeywordEntry {
  en: string
  zh: string
  abbr?: string   // 行业缩写，翻译时保留原文
  weight?: number // 权重 1-3，越高越核心
}

export interface DimensionKeywords {
  dimension: Dimension
  labelZh: string
  labelEn: string
  keywords: KeywordEntry[]
}

export const KEYWORD_MATRIX: DimensionKeywords[] = [
  // ── 1. 模具 (Molds) ──────────────────────────────────────────────────────────
  {
    dimension: 'molds',
    labelZh: '模具',
    labelEn: 'Molds & Tooling',
    keywords: [
      { en: 'injection mold',              zh: '注塑模具',     weight: 3 },
      { en: 'blow mold',                   zh: '吹塑模具',     weight: 3 },
      { en: 'compression mold',            zh: '压缩模具',     weight: 2 },
      { en: 'transfer mold',                zh: '传递模具',     weight: 2 },
      { en: 'hot runner',                  zh: '热流道',       abbr: 'HR',   weight: 3 },
      { en: 'cold runner',                 zh: '冷流道',       abbr: 'CR',   weight: 2 },
      { en: 'mold cavity',                 zh: '模腔',         weight: 2 },
      { en: 'mold core',                   zh: '模芯',         weight: 2 },
      { en: 'gate design',                 zh: '浇口设计',     weight: 2 },
      { en: 'ejection system',              zh: '顶出系统',     weight: 2 },
      { en: 'cooling channel',             zh: '冷却水道',     weight: 2 },
      { en: 'parting line',                zh: '分型面',       weight: 2 },
      { en: 'draft angle',                 zh: '脱模角',       weight: 2 },
      { en: 'mold base',                   zh: '模架',         weight: 2 },
      { en: 'precision mold',              zh: '精密模具',     weight: 3 },
      { en: 'multi-cavity mold',           zh: '多腔模具',     weight: 3 },
      { en: 'stack mold',                  zh: '叠层模具',     weight: 2 },
      { en: 'family mold',                 zh: '家族模具',     weight: 2 },
      { en: 'insert molding tool',         zh: '嵌件模具',     weight: 2 },
      { en: 'unscrewing mold',             zh: '旋转脱模模具', weight: 2 },
      { en: 'thin-wall mold',              zh: '薄壁模具',     weight: 2 },
      { en: 'conformal cooling',           zh: '随形冷却',     weight: 3 },
      { en: 'mold flow analysis',          zh: '模流分析',     abbr: 'MFA',  weight: 3 },
      { en: 'tooling cost',                zh: '模具费用',     weight: 2 },
      { en: 'mold maintenance',            zh: '模具保养',     weight: 2 },
      { en: '3D printed mold',             zh: '3D打印模具',   abbr: '3DP',  weight: 3 },
      { en: 'rapid tooling',              zh: '快速制模',     weight: 2 },
      { en: 'mold steel',                  zh: '模具钢',       weight: 2 },
      { en: 'cavity surface treatment',   zh: '模具表面处理', weight: 2 },
      { en: 'textured mold',               zh: '皮纹模具',     weight: 2 },
    ],
  },

  // ── 2. 成型 (Molding) ────────────────────────────────────────────────────────
  {
    dimension: 'molding',
    labelZh: '成型加工',
    labelEn: 'Molding & Processing',
    keywords: [
      { en: 'injection molding',                   zh: '注塑成型',         weight: 3 },
      { en: 'extrusion',                           zh: '挤出成型',         weight: 3 },
      { en: 'blow molding',                        zh: '吹塑成型',         weight: 3 },
      { en: 'thermoforming',                       zh: '热成型',           weight: 3 },
      { en: 'rotational molding',                  zh: '滚塑成型',         weight: 2 },
      { en: 'compression molding',                 zh: '压缩成型',         weight: 2 },
      { en: 'transfer molding',                    zh: '传递成型',         weight: 2 },
      { en: 'gas-assisted injection molding',     zh: '气辅注塑',         weight: 2 },
      { en: 'two-shot molding',                   zh: '双色注塑',         weight: 2 },
      { en: 'in-mold labeling',                   zh: '模内贴标',         abbr: 'IML',  weight: 3 },
      { en: 'micro molding',                      zh: '微成型',           weight: 2 },
      { en: 'insert molding',                      zh: '嵌件注塑',         weight: 2 },
      { en: 'overmolding',                         zh: '包覆成型',         weight: 2 },
      { en: 'co-injection molding',               zh: '共注射成型',       weight: 2 },
      { en: 'film extrusion',                      zh: '薄膜挤出',         weight: 2 },
      { en: 'pipe extrusion',                      zh: '管材挤出',         weight: 2 },
      { en: 'profile extrusion',                   zh: '型材挤出',         weight: 2 },
      { en: 'clamping force',                      zh: '锁模力',           weight: 2 },
      { en: 'cycle time',                          zh: '成型周期',         weight: 3 },
      { en: 'barrel temperature',                  zh: '料筒温度',         weight: 2 },
      { en: 'melt flow index',                     zh: '熔体流动指数',     abbr: 'MFI',  weight: 3 },
      { en: 'screw design',                        zh: '螺杆设计',         weight: 2 },
      { en: 'energy efficiency',                   zh: '能效',             weight: 3 },
      { en: 'Industry 4.0',                        zh: '工业4.0',          weight: 2 },
      { en: 'smart manufacturing',                 zh: '智能制造',         weight: 3 },
      { en: 'process optimization',                zh: '工艺优化',         weight: 2 },
      { en: 'predictive maintenance',             zh: '预测性维护',       weight: 2 },
      { en: 'digital twin',                        zh: '数字孪生',         weight: 2 },
      { en: 'quality control',                     zh: '质量控制',         weight: 3 },
    ],
  },

  // ── 3. 再生塑料 (Recycled) ─────────────────────────────────────────────────
  {
    dimension: 'recycled',
    labelZh: '再生塑料',
    labelEn: 'Recycled Plastic',
    keywords: [
      { en: 'post-consumer resin',              zh: 'PCR再生料',           abbr: 'PCR',    weight: 3 },
      { en: 'recycled PET',                    zh: '再生PET',             abbr: 'rPET',   weight: 3 },
      { en: 'recycled PP',                     zh: '再生PP',              abbr: 'rPP',    weight: 3 },
      { en: 'recycled PE',                     zh: '再生PE',              abbr: 'rPE',    weight: 3 },
      { en: 'recycled HDPE',                   zh: '再生高密度聚乙烯',    abbr: 'rHDPE',  weight: 3 },
      { en: 'recycled LDPE',                   zh: '再生低密度聚乙烯',    abbr: 'rLDPE',  weight: 2 },
      { en: 'post-industrial resin',            zh: '工业后再生料',         abbr: 'PIR',    weight: 2 },
      { en: 'ocean-bound plastic',              zh: '海洋回收塑料',         abbr: 'OBP',    weight: 3 },
      { en: 'food-grade recycled',              zh: '食品级再生料',         weight: 3 },
      { en: 'bottle flake',                     zh: '瓶片',                 weight: 3 },
      { en: 'recycled compound',                zh: '再生改性料',           weight: 2 },
      { en: 'Global Recycled Standard',         zh: 'GRS认证',              abbr: 'GRS',    weight: 3 },
      { en: 'ISCC PLUS',                        zh: 'ISCC PLUS认证',        abbr: 'ISCC',   weight: 3 },
      { en: 'mass balance',                     zh: '质量平衡法',           weight: 2 },
      { en: 'recycled content',                 zh: '再生料含量',           abbr: 'RC',     weight: 3 },
      { en: 'high-purity flake',                zh: '高纯度片料',           abbr: 'HPF',    weight: 2 },
      { en: 'mechanical recycled granules',    zh: '机械再生颗粒',          abbr: 'MRG',    weight: 2 },
      { en: 'chemically recycled resin',        zh: '化学再生料',           abbr: 'CRR',    weight: 3 },
      { en: 'rPET',                              zh: '再生PET粒子',         weight: 3 },
      { en: 'depolymerized monomer',             zh: '解聚单体',             weight: 3 },
    ],
  },

  // ── 4. 生物基材料 (Bio-based) ─────────────────────────────────────────────
  {
    dimension: 'bio',
    labelZh: '生物基材料',
    labelEn: 'Bio-based Materials',
    keywords: [
      { en: 'bio-based polymer',                zh: '生物基聚合物',         weight: 3 },
      { en: 'polylactic acid',                 zh: '聚乳酸',               abbr: 'PLA',    weight: 3 },
      { en: 'polyhydroxyalkanoate',            zh: '聚羟基烷酸酯',         abbr: 'PHA',    weight: 3 },
      { en: 'PBAT',                             zh: 'PBAT生物降解塑料',    abbr: 'PBAT',   weight: 2 },
      { en: 'bio-PE',                           zh: '生物基聚乙烯',         weight: 2 },
      { en: 'bio-PP',                           zh: '生物基聚丙烯',         weight: 2 },
      { en: 'compostable plastic',              zh: '可堆肥塑料',           weight: 3 },
      { en: 'biodegradable plastic',            zh: '可生物降解塑料',       weight: 3 },
      { en: 'bio-attributed monomer',           zh: '生物属性单体',         weight: 2 },
      { en: 'bio-based plasticizer',            zh: '生物基增塑剂',         weight: 3 },
      { en: 'starch-based plastic',            zh: '淀粉基塑料',           weight: 2 },
      { en: 'cellulose-based',                 zh: '纤维素基材料',         weight: 2 },
    ],
  },

  // ── 5. 助剂 (Additives) ──────────────────────────────────────────────────────
  {
    dimension: 'additives',
    labelZh: '助剂化学品',
    labelEn: 'Additives & Chemicals',
    keywords: [
      { en: 'plasticizer',                  zh: '增塑剂',        weight: 3 },
      { en: 'heat stabilizer',              zh: '热稳定剂',      weight: 3 },
      { en: 'UV stabilizer',                zh: 'UV稳定剂',      weight: 3 },
      { en: 'antioxidant',                 zh: '抗氧剂',        weight: 3 },
      { en: 'flame retardant',             zh: '阻燃剂',        weight: 3 },
      { en: 'PFAS-free',                   zh: '无全氟化合物',   weight: 3 },
      { en: 'halogen-free flame retardant',zh: '无卤阻燃剂',    weight: 3 },
      { en: 'lubricant',                   zh: '润滑剂',        weight: 2 },
      { en: 'impact modifier',             zh: '抗冲改性剂',    weight: 3 },
      { en: 'nucleating agent',            zh: '成核剂',        weight: 2 },
      { en: 'clarifying agent',            zh: '透明剂',        weight: 2 },
      { en: 'chemical blowing agent',      zh: '化学发泡剂',    weight: 2 },
      { en: 'coupling agent',              zh: '偶联剂',        weight: 2 },
      { en: 'processing aid',              zh: '加工助剂',      weight: 2 },
      { en: 'antimicrobial agent',         zh: '抗菌剂',        weight: 2 },
      { en: 'anti-static agent',            zh: '抗静电剂',      weight: 2 },
      { en: 'chain extender',              zh: '链扩展剂',      weight: 2 },
      { en: 'compatibilizer',              zh: '相容剂',        weight: 2 },
      { en: 'antifog agent',               zh: '防雾剂',        weight: 2 },
      { en: 'slip agent',                  zh: '爽滑剂',        weight: 2 },
      { en: 'REACH regulation',            zh: 'REACH法规',     weight: 3 },
      { en: 'RoHS compliance',             zh: 'RoHS合规',      weight: 3 },
      { en: 'TSCA compliance',             zh: 'TSCA合规',      weight: 3 },
      { en: 'phthalate-free',              zh: '无邻苯二甲酸酯', weight: 3 },
      { en: 'BPA-free',                    zh: '无双酚A',       weight: 3 },
      { en: 'organotin-free',              zh: '无有机锡',      weight: 2 },
      { en: 'non-toxic additive',          zh: '无毒助剂',      weight: 3 },
      { en: 'bio-based plasticizer',        zh: '生物基增塑剂',  weight: 3 },
    ],
  },

  // ── 6. 辅料 (Auxiliaries) ───────────────────────────────────────────────────
  {
    dimension: 'auxiliaries',
    labelZh: '辅助材料与设备',
    labelEn: 'Auxiliaries & Equipment',
    keywords: [
      { en: 'color masterbatch',             zh: '色母粒',         weight: 3 },
      { en: 'functional masterbatch',        zh: '功能性母粒',     weight: 3 },
      { en: 'white masterbatch',             zh: '白色母粒',       weight: 2 },
      { en: 'black masterbatch',             zh: '黑色母粒',       weight: 2 },
      { en: 'mineral filler',                zh: '矿物填充剂',     weight: 2 },
      { en: 'calcium carbonate filler',      zh: '碳酸钙填充剂',   weight: 2 },
      { en: 'glass fiber reinforced',        zh: '玻璃纤维增强',   weight: 3 },
      { en: 'carbon fiber',                  zh: '碳纤维',         weight: 2 },
      { en: 'natural fiber composite',        zh: '天然纤维复合',   weight: 2 },
      { en: 'barrier coating',               zh: '阻隔涂层',       weight: 2 },
      { en: 'mold release agent',             zh: '脱模剂',         weight: 2 },
      { en: 'purging compound',              zh: '清洗料',         weight: 2 },
      { en: 'drying system',                 zh: '干燥系统',       weight: 2 },
      { en: 'mold temperature controller',  zh: '模温机',          weight: 2 },
      { en: 'granulator',                    zh: '造粒机',         weight: 2 },
      { en: 'blending system',                zh: '混料系统',       weight: 2 },
      { en: 'conveying system',              zh: '输送系统',       weight: 2 },
      { en: 'gravimetric blender',           zh: '重量式混料机',   weight: 2 },
      { en: 'hot plate welding',              zh: '热板焊接',       weight: 2 },
      { en: 'ultrasonic welding',             zh: '超声波焊接',     weight: 2 },
      { en: 'vibration welding',              zh: '振动焊接',       weight: 2 },
      { en: 'laser welding',                  zh: '激光焊接',       weight: 2 },
      { en: 'flexible packaging film',        zh: '软包装薄膜',     weight: 3 },
      { en: 'rigid packaging',                zh: '硬质包装',       weight: 2 },
      { en: 'label adhesive',                 zh: '标签粘合剂',     weight: 2 },
      { en: 'closure system',                 zh: '封盖系统',       weight: 2 },
      { en: 'quality control system',         zh: '质量控制系统',   weight: 2 },
      { en: 'metal detector',                 zh: '金属检测机',     weight: 2 },
      { en: 'vision inspection system',       zh: '视觉检测系统',   weight: 2 },
    ],
  },

  // ── 7. 回收再生 (Recycling) ─────────────────────────────────────────────────
  {
    dimension: 'recycling',
    labelZh: '回收再生',
    labelEn: 'Recycling & Circular Economy',
    keywords: [
      { en: 'mechanical recycling',                 zh: '机械回收',              abbr: 'MR',    weight: 3 },
      { en: 'chemical recycling',                   zh: '化学回收',              abbr: 'CR',    weight: 3 },
      { en: 'pyrolysis',                            zh: '热解',                  weight: 3 },
      { en: 'depolymerization',                     zh: '解聚',                  weight: 3 },
      { en: 'glycolysis',                           zh: '醇解',                  weight: 2 },
      { en: 'hydrolysis',                           zh: '水解',                  weight: 2 },
      { en: 'methanolysis',                         zh: '甲醇醇解',              weight: 2 },
      { en: 'solvent-based purification',           zh: '溶剂法提纯',            abbr: 'SBP',   weight: 2 },
      { en: 'extended producer responsibility',     zh: '生产者责任延伸',        abbr: 'EPR',   weight: 3 },
      { en: 'deposit return scheme',                zh: '押金返还制度',          abbr: 'DRS',   weight: 3 },
      { en: 'recycling rate',                       zh: '回收率',                weight: 3 },
      { en: 'collection infrastructure',            zh: '收集基础设施',          weight: 2 },
      { en: 'NIR sorting',                           zh: '近红外分选',            abbr: 'NIR',   weight: 3 },
      { en: 'AI-powered sorting',                    zh: 'AI智能分选',            weight: 3 },
      { en: 'robotic sorting',                       zh: '机器人分选',            weight: 2 },
      { en: 'bottle-to-bottle',                      zh: '瓶到瓶回收',            abbr: 'B2B',   weight: 3 },
      { en: 'food-contact compliance',              zh: '食品接触合规',          abbr: 'FC',    weight: 3 },
      { en: 'recyclability by design',              zh: '可回收设计',            abbr: 'DfR',   weight: 3 },
      { en: 'eco-design',                            zh: '生态设计',              weight: 2 },
      { en: 'waste plastic',                         zh: '废塑料',                weight: 2 },
      { en: 'plastic waste management',              zh: '塑料废弃物管理',        weight: 3 },
      { en: 'circular economy',                      zh: '循环经济',              abbr: 'CE',    weight: 3 },
      { en: 'recycled content mandate',              zh: '再生料含量强制要求',    weight: 3 },
      { en: 'PPWR',                                  zh: '包装和包装废物法规',    abbr: 'PPWR',  weight: 3 },
      { en: 'carbon border adjustment mechanism',    zh: '碳边境调节机制',        abbr: 'CBAM',  weight: 3 },
      { en: 'carbon footprint',                      zh: '碳足迹',                abbr: 'CF',    weight: 3 },
      { en: 'life cycle assessment',                 zh: '生命周期评估',          abbr: 'LCA',   weight: 3 },
      { en: 'Ellen MacArthur Foundation',            zh: '艾伦·麦克阿瑟基金会',   abbr: 'EMF',   weight: 2 },
      { en: 'plastic credits',                       zh: '塑料信用',              weight: 2 },
      { en: 'ocean plastic',                         zh: '海洋塑料',              weight: 2 },
      { en: 'upcycling',                             zh: '升级利用',              weight: 2 },
    ],
  },

  // ── 8. 重复使用 (Reuse) ─────────────────────────────────────────────────────
  {
    dimension: 'reuse',
    labelZh: '重复使用',
    labelEn: 'Reuse & Refill Systems',
    keywords: [
      { en: 'reusable packaging',               zh: '可重复使用包装',     weight: 3 },
      { en: 'refill system',                    zh: '再填充系统',         weight: 3 },
      { en: 'PPWR reuse target',                zh: 'PPWR重复使用目标',   abbr: 'PPWR',  weight: 3 },
      { en: 'deposit return',                   zh: '押金返还',           weight: 3 },
      { en: 'multi-trip packaging',             zh: '多次使用包装',       weight: 3 },
      { en: 'pool system',                      zh: '共用容器系统',       weight: 2 },
      { en: 'reverse logistics',                zh: '逆向物流',           weight: 2 },
      { en: 'reuse infrastructure',            zh: '重复使用基础设施',   weight: 2 },
      { en: 'return on reuse',                   zh: '重复使用回报',       weight: 2 },
      { en: 'life cycle assessment',             zh: '生命周期评估',       abbr: 'LCA',   weight: 3 },
      { en: 'carbon footprint',                  zh: '碳足迹',             weight: 3 },
      { en: 'single-use plastic ban',           zh: '一次性塑料禁令',     weight: 3 },
      { en: 'SUP directive',                      zh: '一次性塑料指令',     abbr: 'SUP',   weight: 3 },
      { en: 'zero waste',                       zh: '零废弃',             weight: 2 },
      { en: 'packaging reduction',               zh: '包装减量',           weight: 2 },
      { en: 'lightweighting',                   zh: '轻量化',             weight: 2 },
      { en: 'reuse business model',              zh: '重复使用商业模式',   weight: 2 },
      { en: 'B2B reuse',                        zh: 'B2B重复使用',        weight: 2 },
      { en: 'B2C reuse',                        zh: 'B2C重复使用',        weight: 2 },
      { en: 'smart packaging',                   zh: '智能包装',           weight: 2 },
      { en: 'serialization',                    zh: '序列化追踪',         weight: 2 },
      { en: 'digital product passport',          zh: '数字产品护照',       abbr: 'DPP',   weight: 3 },
      { en: 'reuse metrics',                    zh: '重复使用指标',       weight: 2 },
      { en: 'reuse rate',                       zh: '重复使用率',         weight: 3 },
      { en: 'reusable container',                zh: '可重复使用容器',     weight: 3 },
      { en: 'refill station',                   zh: '补充站',             weight: 2 },
      { en: 'closed-loop system',                zh: '闭环系统',           weight: 3 },
      { en: 'open-loop system',                  zh: '开环系统',           weight: 2 },
      { en: 'looping',                          zh: '循环使用',           weight: 2 },
    ],
  },
]

// ── 排除词库 ──────────────────────────────────────────────────────────────────

export const NEGATIVE_KEYWORDS: NegativeCategory[] = [
  // ── 广告/推广类 ──────────────────────────────────────────────────────────────
  { category: 'ads', patterns: [
    'sponsored', 'advertisement', 'ad-', 'ads by', 'promo code', 'discount',
    'buy now', 'limited offer', 'click here', 'sign up for free', 'free trial',
    'affiliate', 'partner content', 'sponsored by', 'brought to you by',
    'subscribe now', 'newsletter signup', 'get started', 'free download',
    'upgrade now', 'special offer', 'limited time', 'act now', 'order now',
    'shop now', 'sale up to', 'best price', 'money-back guarantee',
  ]},
  // ── 娱乐/生活类 ─────────────────────────────────────────────────────────────
  { category: 'entertainment', patterns: [
    'celebrity', 'star', 'viral video', 'funny', 'meme', 'entertainment',
    'sports', 'football', 'basketball', 'soccer', 'tennis', 'gaming',
    'video game', 'esports', 'twitch', 'stream', 'movie', 'film', 'series',
    'music', 'concert', 'festival', 'travel', 'vacation', 'holiday destination',
    'recipe', 'cooking', 'food', 'restaurant', 'hotel', 'airbnb',
    'dating', 'relationship', 'fitness', 'workout', 'health',
  ]},
  // ── 金融/诈骗类 ──────────────────────────────────────────────────────────────
  { category: 'finance', patterns: [
    'casino', 'gambling', 'forex', 'cryptocurrency', 'bitcoin', 'ethereum',
    'NFT', 'trading signal', 'invest now', 'get rich', 'passive income',
    'loan', 'insurance quote', 'credit score', 'debt relief',
    'fast money', 'make money online', 'work from home', 'mlm',
    'pyramid scheme', 'bitcoin giveaway', 'airdrop', 'token sale',
  ]},
  // ── 健康/药品类 ──────────────────────────────────────────────────────────────
  { category: 'health', patterns: [
    'diet pill', 'weight loss', 'male enhancement', 'skin care', 'beauty product',
    'supplement', 'vitamin', 'cure for', 'miracle', 'panacea', 'miracle cure',
  ]},
  // ── 招聘类（非行业）───────────────────────────────────────────────────────────
  { category: 'jobs', patterns: [
    'jobs hiring', 'work from home', 'get rich quick', 'career opportunity',
    'earn money', 'part-time job', 'remote job', 'freelance',
  ]},
  // ── 政治/宗教/争议 ───────────────────────────────────────────────────────────
  { category: 'noise', patterns: [
    'political', 'election', 'political campaign', 'vote', 'religion',
    'ideology', 'opinion', 'personal attack', 'gossip',
  ]},
]

export interface NegativeCategory {
  category: string
  patterns: string[]
}

/** 检查是否命中排除词（返回命中的类别，若无命中返回 null） */
export function checkNegative(text: string): string | null {
  const lower = text.toLowerCase()
  for (const { category, patterns } of NEGATIVE_KEYWORDS) {
    for (const kw of patterns) {
      if (lower.includes(kw.toLowerCase())) return category
    }
  }
  return null
}

/** 兼容旧 API */
export function isNegative(text: string): boolean {
  return checkNegative(text) !== null
}

// ── 快速检索工具 ──────────────────────────────────────────────────────────────

/** 从文本推断最匹配的维度（按权重排序，取前3） */
export function inferDimensions(text: string): Dimension[] {
  const lower = text.toLowerCase()
  const scores: Record<Dimension, number> = {
    molds: 0, molding: 0, recycled: 0, bio: 0,
    additives: 0, auxiliaries: 0, recycling: 0, reuse: 0,
  }

  for (const dim of KEYWORD_MATRIX) {
    for (const kw of dim.keywords) {
      const w = kw.weight ?? 1
      if (lower.includes(kw.en.toLowerCase())) scores[dim.dimension] += w
      if (lower.includes(kw.zh))               scores[dim.dimension] += w
      if (kw.abbr && lower.includes(kw.abbr.toLowerCase())) scores[dim.dimension] += w * 2
    }
  }

  return (Object.entries(scores) as [Dimension, number][])
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([d]) => d)
}

/** 从文本提取所有命中的关键词及其维度 */
export function matchKeywords(text: string): Array<{ dimension: Dimension; keyword: KeywordEntry }> {
  const lower = text.toLowerCase()
  const matches: Array<{ dimension: Dimension; keyword: KeywordEntry }> = []

  for (const dim of KEYWORD_MATRIX) {
    for (const kw of dim.keywords) {
      if (lower.includes(kw.en.toLowerCase()) || lower.includes(kw.zh) ||
          (kw.abbr && lower.includes(kw.abbr.toLowerCase()))) {
        matches.push({ dimension: dim.dimension, keyword: kw })
      }
    }
  }

  return matches
}

/** 构建用于 Zod schema 的 enum 值列表 */
export const DIMENSION_VALUES = KEYWORD_MATRIX.map(d => d.dimension)

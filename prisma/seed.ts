import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const tags = [
  // Material
  { name: 'PET', slug: 'pet', category: 'material', color: '#3B82F6', sortOrder: 1 },
  { name: 'HDPE', slug: 'hdpe', category: 'material', color: '#3B82F6', sortOrder: 2 },
  { name: 'LDPE', slug: 'ldpe', category: 'material', color: '#3B82F6', sortOrder: 3 },
  { name: 'PP', slug: 'pp', category: 'material', color: '#3B82F6', sortOrder: 4 },
  { name: 'PS', slug: 'ps', category: 'material', color: '#3B82F6', sortOrder: 5 },
  { name: 'PVC', slug: 'pvc', category: 'material', color: '#3B82F6', sortOrder: 6 },
  { name: '混合塑料', slug: 'mixed-plastic', category: 'material', color: '#3B82F6', sortOrder: 7 },
  // Process
  { name: '回收', slug: 'collection', category: 'process', color: '#10B981', sortOrder: 1 },
  { name: '清洗', slug: 'washing', category: 'process', color: '#10B981', sortOrder: 2 },
  { name: '造粒', slug: 'pelletizing', category: 'process', color: '#10B981', sortOrder: 3 },
  { name: '再生利用', slug: 'reuse', category: 'process', color: '#10B981', sortOrder: 4 },
  // Technology
  { name: '机械回收', slug: 'mechanical-recycling', category: 'technology', color: '#8B5CF6', sortOrder: 1 },
  { name: '化学回收', slug: 'chemical-recycling', category: 'technology', color: '#8B5CF6', sortOrder: 2 },
  { name: '酶解回收', slug: 'enzymatic-recycling', category: 'technology', color: '#8B5CF6', sortOrder: 3 },
  // Region
  { name: '中国', slug: 'china', category: 'region', color: '#F59E0B', sortOrder: 1 },
  { name: '欧盟', slug: 'eu', category: 'region', color: '#F59E0B', sortOrder: 2 },
  { name: '美国', slug: 'usa', category: 'region', color: '#F59E0B', sortOrder: 3 },
  { name: '东南亚', slug: 'southeast-asia', category: 'region', color: '#F59E0B', sortOrder: 4 },
  // Topic
  { name: '政策', slug: 'policy', category: 'topic', color: '#EF4444', sortOrder: 1 },
  { name: '价格', slug: 'price', category: 'topic', color: '#EF4444', sortOrder: 2 },
  { name: '技术突破', slug: 'tech-breakthrough', category: 'topic', color: '#EF4444', sortOrder: 3 },
  { name: '企业融资', slug: 'financing', category: 'topic', color: '#EF4444', sortOrder: 4 },
  { name: '展会', slug: 'expo', category: 'topic', color: '#EF4444', sortOrder: 5 },
  // Additional topics for carbon tax
  { name: '碳关税', slug: 'carbon-tariff', category: 'topic', color: '#EF4444', sortOrder: 6 },
  { name: '循环经济', slug: 'circular-economy', category: 'topic', color: '#EF4444', sortOrder: 7 },
]

const newsData = [
  {
    title: '欧盟《包装和包装废弃物法规》正式生效，PET回收率目标提至90%',
    summary: '2024年欧盟新包装法规要求成员国在2030年前实现PET饮料瓶90%回收率目标，并强制要求消费后再生料含量不低于30%，对全球PET再生产业链影响深远。',
    content: `<p>2024年，欧盟《包装和包装废弃物法规》（PPWR）正式生效，这一里程碑性的立法对整个塑料回收行业产生了深远影响。</p>

<h2>核心要求</h2>
<p>新法规要求欧盟成员国在2030年前实现以下目标：</p>
<ul>
  <li>PET饮料瓶回收率达到90%</li>
  <li>消费后再生料（PCR）含量不低于30%</li>
  <li>所有塑料包装必须在2030年前实现可回收设计</li>
</ul>

<h2>对行业的影响</h2>
<p>此次立法对全球PET再生产业链影响深远。欧洲再生PET供应商面临巨大机遇，预计2025-2030年间欧洲食品级再生PET需求量将增长超过200%。</p>

<p>中国PET再生料出口商需关注欧盟对进口再生料的认证要求，包括碳足迹核算和可追溯性文件。欧盟市场对高品质食品级再生PET的需求激增，将进一步推动化学回收技术的商业化进程。</p>

<h2>行业回应</h2>
<p>多家大型品牌商（包括雀巢、可口可乐、百事可乐）已宣布将加大在欧洲的再生料采购力度，以满足法规要求。这将为欧洲及全球再生塑料行业带来数十亿欧元的投资机遇。</p>`,
    source: '欧盟官方公报',
    sourceUrl: 'https://eur-lex.europa.eu',
    author: '政策研究部',
    viewCount: 1520,
    publishedAt: new Date('2025-03-15'),
    tags: ['pet', 'eu', 'policy', 'mechanical-recycling'],
  },
  {
    title: '华南再生塑料市场周报：HDPE价格回调，PP价格维稳',
    summary: '本周华南市场HDPE再生料价格较上周下跌200-300元/吨，PP再生料价格基本持平。受海外订单减少和国内库存偏高影响，短期内价格承压。',
    content: `<p>本周（3月18-22日）华南再生塑料市场整体呈现分化走势，HDPE回调而PP维稳。</p>

<h2>HDPE市场</h2>
<p>本周HDPE再生料（注塑级）价格报7,800-8,200元/吨，较上周下跌200-300元/吨。主要原因：</p>
<ul>
  <li>海外订单（主要为东南亚方向）较上月减少约15%</li>
  <li>广东、浙江两省库存较月初增加约8%</li>
  <li>原生HDPE价格小幅下调，压制再生料价格空间</li>
</ul>

<h2>PP市场</h2>
<p>PP再生料（注塑级）价格报7,200-7,600元/吨，与上周基本持平。汽车零部件企业采购需求稳定，支撑PP再生料价格。</p>

<h2>后市展望</h2>
<p>综合来看，下周华南再生塑料市场预计HDPE将继续小幅承压，PP有望维稳或小幅回升。建议企业适量补库，控制库存风险。</p>`,
    source: '再生塑料网',
    sourceUrl: 'https://www.rslw.com',
    author: '市场部',
    viewCount: 2340,
    publishedAt: new Date('2025-03-22'),
    tags: ['hdpe', 'pp', 'china', 'price'],
  },
  {
    title: '化学回收突破：Eastman公司聚酯解聚技术实现商业化量产',
    summary: '美国Eastman公司宣布其解聚技术生产线实现全面商业化运营，年处理废旧PET能力达110,000吨，标志着化学回收技术进入大规模产业化阶段。',
    content: `<p>美国Eastman公司近日宣布，其位于田纳西州金斯波特的聚酯解聚化学回收生产线已正式实现全面商业化运营，年处理废旧PET能力达到110,000吨。</p>

<h2>技术路线</h2>
<p>Eastman采用的是甲醇解聚（Methanolysis）技术，该技术能够将废旧PET塑料完全分解为对苯二甲酸二甲酯（DMT）和乙二醇（MEG），再重新聚合成食品级原生品质的PET树脂。</p>

<p>与传统机械回收相比，化学回收的优势在于：</p>
<ul>
  <li>可处理受污染或难以机械分选的混合废旧塑料</li>
  <li>产出食品接触级别的再生原料</li>
  <li>循环次数理论上不受限制</li>
</ul>

<h2>商业意义</h2>
<p>这是迄今为止全球最大规模的聚酯解聚商业化项目。Eastman已与宝洁、百思买等消费品巨头签署长期供应协议，承诺提供"分子回收"PET原料。</p>

<h2>行业影响</h2>
<p>此次商业化标志着化学回收技术从实验室走向大规模工业应用的关键节点。预计到2030年，全球化学回收PET产能将超过500万吨/年。</p>`,
    source: 'Chemical & Engineering News',
    sourceUrl: 'https://cen.acs.org',
    author: '技术研究部',
    viewCount: 3210,
    publishedAt: new Date('2025-03-18'),
    tags: ['pet', 'chemical-recycling', 'tech-breakthrough', 'usa'],
  },
  {
    title: '酶解回收PET技术获重大突破，法国Carbios与宝洁达成合作',
    summary: '法国Carbios宣布与宝洁公司签署长期供应协议，使用酶催化降解技术生产食品级再生PET原料，开创了生物酶解回收技术商业化的新里程碑。',
    content: `<p>法国生物技术公司Carbios近日宣布与全球消费品巨头宝洁公司签署长期合作协议，将利用其专利酶解回收技术为宝洁提供食品级再生PET原料。</p>

<h2>酶解技术原理</h2>
<p>Carbios开发的LEAF™技术利用经基因工程改造的PETase酶（源自大叶可卡树叶），在72小时内可将废旧PET瓶完全降解为纯净的对苯二甲酸（TPA）和乙二醇（MEG）单体，纯度达99%以上。</p>

<p>相比化学法，酶解法的优势：</p>
<ul>
  <li>反应温度较低（约72°C），能耗更小</li>
  <li>不使用甲醇等有机溶剂，更为环保</li>
  <li>产物纯度极高，直接用于食品级PET生产</li>
</ul>

<h2>合作规模</h2>
<p>根据协议，Carbios将在法国建立年产50,000吨再生PET单体的工厂，预计2026年投产，首批产品将用于宝洁旗下多个日化品牌的包装。</p>

<p>宝洁同时承诺向Carbios提供融资支持，并优先采购其再生PET原料，帮助其实现规模化扩张。</p>`,
    source: 'Carbios官方新闻',
    sourceUrl: 'https://www.carbios.com',
    author: '技术研究部',
    viewCount: 2890,
    publishedAt: new Date('2025-03-10'),
    tags: ['pet', 'enzymatic-recycling', 'tech-breakthrough', 'eu', 'financing'],
  },
  {
    title: '中国再生塑料行业协会发布2025年行业白皮书',
    summary: '白皮书显示中国2024年废塑料回收量达1980万吨，同比增长8.3%，再生料产值突破3000亿元，但回收率仍低于发达国家平均水平。',
    content: `<p>中国再生塑料行业协会（CRRA）近日在北京发布《2025中国再生塑料行业发展白皮书》，全面梳理了中国废塑料回收行业2024年的发展现状与未来趋势。</p>

<h2>主要数据</h2>
<p>白皮书核心数据显示：</p>
<ul>
  <li>2024年中国废塑料回收量达1,980万吨，同比增长8.3%</li>
  <li>再生料产值突破3,000亿元人民币</li>
  <li>从业企业超过6万家，直接就业人员约120万人</li>
  <li>废塑料回收率约为30%，低于德国（55%）、日本（83%）等发达国家</li>
</ul>

<h2>政策驱动</h2>
<p>2024年，国家发改委、商务部等多部门联合推进废塑料回收体系建设，"以旧换新"政策带动家电废旧塑料回收显著增长。</p>

<h2>未来展望</h2>
<p>白皮书预测，到2030年，中国废塑料回收量将突破3,000万吨，回收率提升至45%以上。化学回收和酶解回收等新型技术的产业化将成为未来增量的重要来源。</p>`,
    source: '中国再生塑料行业协会',
    sourceUrl: 'https://www.crra.org.cn',
    author: '研究院',
    viewCount: 4120,
    publishedAt: new Date('2025-02-28'),
    tags: ['mixed-plastic', 'china', 'policy', 'collection'],
  },
  {
    title: '东南亚LDPE薄膜回收产能扩张加速，越南新建三条造粒线',
    summary: '越南河内至少三家再生塑料企业宣布扩建计划，合计新增LDPE再生造粒产能约5万吨/年，主要面向日本、韩国等出口市场需求。',
    content: `<p>东南亚废旧塑料薄膜回收市场正在加速扩张。越南河内周边地区至少三家再生塑料企业宣布了新建或扩建LDPE再生造粒线的计划，合计新增年产能约5万吨。</p>

<h2>扩张背景</h2>
<p>这波扩建潮的驱动力主要来自：</p>
<ul>
  <li>日本、韩国品牌商加大再生料采购比例，LDPE再生薄膜需求旺盛</li>
  <li>欧盟包装法规推动全球品牌商提高PCR含量，向上游施压</li>
  <li>越南劳动力和土地成本相对较低，具有竞争优势</li>
</ul>

<h2>技术升级</h2>
<p>新建造粒线普遍采用双螺杆造粒机和在线过滤系统，产品质量较早期设备有显著提升。部分企业还引进了光学分选设备，提高LDPE纯度。</p>

<h2>市场前景</h2>
<p>东南亚废塑料回收行业正迎来快速发展期。分析人士预计，未来3年越南LDPE再生料出口量将翻倍，泰国、印度尼西亚也在跟进布局。</p>`,
    source: 'Plastics Recycling Update Asia',
    sourceUrl: 'https://www.plasticsrecycling.org',
    author: '国际市场部',
    viewCount: 1680,
    publishedAt: new Date('2025-03-05'),
    tags: ['ldpe', 'southeast-asia', 'pelletizing', 'financing'],
  },
  {
    title: '碳关税CBAM扩围至塑料制品，出口企业需提前布局回收认证',
    summary: '欧盟碳边境调节机制（CBAM）第二阶段将于2026年将部分塑料制品纳入覆盖范围，中国出口企业须尽快建立碳足迹核算体系和再生料可追溯认证。',
    content: `<p>欧盟碳边境调节机制（CBAM）的扩围信号越来越明确。根据欧盟委员会2024年底发布的评估报告，CBAM第二阶段（2026-2030年）将把部分塑料制品和包装纳入覆盖范围。</p>

<h2>CBAM机制解读</h2>
<p>CBAM要求进口商为其进口产品在生产过程中排放的碳支付费用，相当于欧盟碳市场（ETS）价格。目前ETS碳价约为65-70欧元/吨CO₂。</p>

<p>对于塑料制品，碳关税的核心计算维度包括：</p>
<ul>
  <li>原材料生产阶段的碳排放（原生树脂 vs 再生料）</li>
  <li>加工制造阶段的能源消耗</li>
  <li>产品运输阶段排放（部分情况下）</li>
</ul>

<h2>再生料的优势</h2>
<p>使用再生料可显著降低产品碳足迹。据测算，以再生PET替代原生PET，碳排放可降低约60-70%，这意味着使用再生料的制品在CBAM下将获得实质性的成本竞争优势。</p>

<h2>应对策略</h2>
<p>建议中国出口企业：立即启动产品全生命周期碳足迹核算；建立再生料使用的可追溯性文件体系；积极获取国际认证（如GRS再生料认证）。</p>`,
    source: '中国化工报',
    sourceUrl: 'https://www.ccin.com.cn',
    author: '政策研究部',
    viewCount: 3560,
    publishedAt: new Date('2025-03-20'),
    tags: ['mixed-plastic', 'eu', 'policy', 'china', 'carbon-tariff'],
  },
  {
    title: '2025慕尼黑IFAT展回顾：塑料回收装备呈现三大趋势',
    summary: 'IFAT 2025展会中，塑料回收装备商重点展示了AI光学分拣、低能耗清洗线和数字化追踪系统三大方向，智能化和低碳化成为装备升级主旋律。',
    content: `<p>2025年IFAT慕尼黑国际水、污水、废物及原材料管理展览会于5月举行，全球超过3,100家参展商展示了最新环保技术和装备。在塑料回收设备领域，三大技术趋势格外引人注目。</p>

<h2>趋势一：AI驱动的光学分拣</h2>
<p>多家设备商展示了集成AI视觉识别的近红外（NIR）分拣系统，分拣精度提升至99%以上。TOMRA、Steinert等领军企业发布了新一代多层次分拣线，可在同一生产线上完成PET、HDPE、PP、PS等多种塑料的精准分类。</p>

<h2>趋势二：低能耗清洗技术</h2>
<p>传统塑料清洗线能耗高、用水量大。本届展会上，多家德国和意大利企业展示了闭环水循环清洗系统，将耗水量降低70%，清洗后的碎片含水率控制在1%以内，显著降低后续干燥能耗。</p>

<h2>趋势三：数字化全链条追踪</h2>
<p>区块链和物联网（IoT）技术被引入废塑料回收全链条管理。部分系统可实现从废料来源地到再生产品的全流程追溯，满足欧盟PPWR对材料可追溯性的要求。</p>`,
    source: '固废观察',
    sourceUrl: 'https://www.solidwaste.com.cn',
    author: '技术编辑部',
    viewCount: 2150,
    publishedAt: new Date('2025-02-20'),
    tags: ['mechanical-recycling', 'eu', 'expo', 'pelletizing', 'washing'],
  },
  {
    title: 'PVC再生利用难题待解，欧盟VinylPlus计划提出新技术路线图',
    summary: '受限于添加剂复杂性，PVC回收率长期低于20%。VinylPlus最新路线图提出溶剂萃取和热解等新技术路径，目标在2030年实现45%回收率。',
    content: `<p>聚氯乙烯（PVC）的回收利用长期以来是塑料回收行业的一大难题。受复杂添加剂体系（增塑剂、稳定剂、阻燃剂等）和产品种类多样性的影响，全球PVC废料回收率不足20%。</p>

<h2>主要挑战</h2>
<p>PVC回收面临的核心挑战：</p>
<ul>
  <li>铅、镉等重金属稳定剂（历史遗留品）污染问题</li>
  <li>邻苯二甲酸酯类增塑剂的回收利用限制</li>
  <li>软硬PVC难以简单分选</li>
  <li>建筑拆迁废料中PVC品种复杂</li>
</ul>

<h2>VinylPlus新路线图</h2>
<p>欧洲PVC行业自愿性可持续发展计划VinylPlus于2025年发布更新版技术路线图，提出三条并行技术路径：溶剂萃取技术（Solvay法）、热解处理、改进的机械分拣与再混配。目标是到2030年实现欧洲PVC年回收量80万吨，回收率从当前的约22%提升至45%。</p>`,
    source: 'VinylPlus',
    sourceUrl: 'https://www.vinylplus.eu',
    author: '技术研究部',
    viewCount: 1420,
    publishedAt: new Date('2025-01-30'),
    tags: ['pvc', 'eu', 'tech-breakthrough', 'reuse'],
  },
  {
    title: '美国《重组资源保护法》草案：要求消费后再生含量最低20%',
    summary: '美国国会提出新立法草案，要求到2030年塑料包装中消费后再生料（PCR）含量不低于20%，违规企业将面临联邦处罚。',
    content: `<p>美国国会参议院环境和公共工程委员会近日公布了《重组资源保护法》（Recycling Reform and Investment Act）草案，这是美国近年来最具实质性的联邦塑料回收立法尝试。</p>

<h2>核心条款</h2>
<p>草案要求：到2030年，在美销售的塑料包装中，消费后再生料（PCR）含量不低于20%；到2035年提升至30%；到2040年达到40%。违规企业将面临联邦贸易委员会（FTC）的处罚。</p>

<h2>配套机制</h2>
<p>草案同时提议建立联邦塑料回收基金，通过对原生塑料征收费用（约0.02美元/磅），用于补贴回收基础设施建设和再生料采购。</p>

<h2>行业反应</h2>
<p>美国再生料生产商协会（ASPCA）对草案表示欢迎，认为强制PCR含量要求将大幅提振国内再生料需求。部分原材料生产商则对可行性表示担忧，指出现有美国再生料供应不足以满足全面实施需求。</p>`,
    source: 'Plastics News',
    sourceUrl: 'https://www.plasticsnews.com',
    author: '政策研究部',
    viewCount: 1980,
    publishedAt: new Date('2025-03-12'),
    tags: ['mixed-plastic', 'usa', 'policy', 'reuse'],
  },
  {
    title: 'PP再生料需求激增，汽车行业成为新兴消纳市场',
    summary: '多家汽车零部件企业采购PP再生料用于非外观件，带动华东地区PP再生料价格上行，汽车行业已成为PP再生料最具增长潜力的终端市场。',
    content: `<p>汽车行业对PP（聚丙烯）再生料的需求正在快速攀升，成为推动华东地区PP再生料价格上行的重要力量。</p>

<h2>需求背景</h2>
<p>在"双碳"目标和欧盟汽车碳排放法规的双重压力下，主流汽车品牌纷纷要求零部件供应商提高再生料使用比例。目前主要应用场景包括：发动机舱护板、底盘护板、门板骨架、座椅骨架等非外观结构件。</p>

<h2>价格动态</h2>
<p>本月华东地区PP再生料（注塑级）价格较年初上涨约8-10%，报价区间7,400-7,800元/吨。业内人士分析，随着更多汽车厂商将再生料使用比例纳入供应商考核指标，PP再生料的供需格局将持续改善。</p>

<h2>质量要求</h2>
<p>汽车行业对PP再生料的质量要求高于一般工业用途，主要关注：熔体流动速率（MFI）稳定性、色差控制、气味等级（通常要求VDA270标准B2级以上）、力学性能一致性。</p>`,
    source: '卓创资讯',
    sourceUrl: 'https://www.sci99.com',
    author: '市场分析师',
    viewCount: 2760,
    publishedAt: new Date('2025-03-08'),
    tags: ['pp', 'china', 'price', 'reuse'],
  },
  {
    title: '机械回收与化学回收互补发展，龙头企业布局全链条战略',
    summary: '国内领先塑料回收企业发布战略报告，将同时布局机械回收扩能和热解化学回收新建产能，形成覆盖不同废料品质的完整处理链条。',
    content: `<p>随着塑料回收行业进入战略深水区，简单的机械回收已难以满足行业升级需求。国内几家头部企业开始布局机械回收与化学回收协同发展的全链条战略。</p>

<h2>战略逻辑</h2>
<p>机械回收与化学回收并非竞争关系，而是互补关系：</p>
<ul>
  <li>机械回收适用于清洁、单一品种的废塑料，成本低、效率高</li>
  <li>化学回收（热解/解聚）则可处理机械回收难以利用的低品质混合废料</li>
  <li>两者结合可最大化废塑料的资源化利用率</li>
</ul>

<h2>投资动态</h2>
<p>格林美、天楹股份等上市公司近期相继公告，计划在现有机械回收基础上新建热解或解聚装置。其中，某龙头企业公告拟投资8亿元建设年处理能力10万吨的废塑料化学回收项目，预计2027年建成投产。</p>

<h2>融资环境</h2>
<p>国家绿色发展基金和多家城投公司已明确表示对废塑料化学回收项目的支持意向，部分项目还获得了欧洲开发性金融机构的资金关注。</p>`,
    source: '21世纪经济报道',
    sourceUrl: 'https://www.21jingji.com',
    author: '产业研究部',
    viewCount: 3340,
    publishedAt: new Date('2025-03-25'),
    tags: ['mechanical-recycling', 'chemical-recycling', 'china', 'financing'],
  },
  {
    title: '废旧家电塑料回收清洗工艺优化：超声波清洗降低能耗40%',
    summary: '中科院过程工程研究所发布研究成果，新型超声波清洗工艺可将废旧家电塑料的污染物去除率提升至98%，同时将整体能耗降低40%。',
    content: `<p>中国科学院过程工程研究所绿色化工工程实验室近日发布了废旧家电塑料回收清洗工艺的最新研究成果，相关论文已发表于《资源、保护与循环》（Resources, Conservation and Recycling）国际期刊。</p>

<h2>研究背景</h2>
<p>废旧家电（家用电器）是废旧塑料的重要来源，每年产生约200万吨塑料废料。由于家电塑料通常含有阻燃剂、金属嵌件残留物和各种涂层，传统清洗工艺难以完全去除，严重影响再生料品质。</p>

<h2>技术突破</h2>
<p>研究团队开发的新型超声波辅助碱性清洗工艺，通过以下机制实现突破：</p>
<ul>
  <li>超声波空化效应有效剥离顽固附着物</li>
  <li>优化碱液浓度和温度组合，减少化学品用量</li>
  <li>闭环水循环系统降低水耗和废水处理负担</li>
</ul>

<p>实验结果显示，与传统热碱清洗工艺相比，新工艺将污染物去除率从85%提升至98%，整体能耗降低40%，清洗后再生料机械性能提升约15%。</p>`,
    source: '中国科学院',
    sourceUrl: 'https://www.cas.cn',
    author: '科研编辑部',
    viewCount: 1890,
    publishedAt: new Date('2025-02-10'),
    tags: ['mixed-plastic', 'washing', 'tech-breakthrough', 'china'],
  },
  {
    title: 'HDPE牛奶瓶封闭式循环试点扩展至全国15个城市',
    summary: '国家发改委扩大牛奶瓶闭环回收试点范围，要求参与乳品企业承担延伸生产者责任（EPR），推动HDPE牛奶瓶从源头分类、定向回收到再生利用的完整闭环。',
    content: `<p>国家发展改革委近日发布通知，将HDPE牛奶瓶封闭式循环回收试点城市从最初的5个扩展至全国15个城市，参与企业覆盖蒙牛、伊利、光明等主要乳品品牌。</p>

<h2>试点模式</h2>
<p>该试点采用"品牌商主导+专业回收商实施"的EPR（延伸生产者责任）模式：</p>
<ul>
  <li>乳品企业在超市和社区设立专用牛奶瓶回收点</li>
  <li>委托专业回收商上门收运，确保不与其他废料混入</li>
  <li>定向送往有资质的再生料加工厂，产出食品接触级HDPE再生料</li>
  <li>再生料优先回用于同品牌新包装（闭环理念）</li>
</ul>

<h2>初步成效</h2>
<p>首批5个试点城市（上海、杭州、成都、广州、北京）实施一年来，HDPE牛奶瓶回收率平均达到68%，远高于全国废旧塑料瓶平均回收率（约40%）。</p>

<h2>政策意义</h2>
<p>这是中国首次大规模推行针对特定品种废旧塑料的EPR机制，为后续扩展到PET饮料瓶、PP餐盒等其他品种奠定制度基础。</p>`,
    source: '国家发展改革委',
    sourceUrl: 'https://www.ndrc.gov.cn',
    author: '政策研究部',
    viewCount: 2430,
    publishedAt: new Date('2025-03-01'),
    tags: ['hdpe', 'china', 'collection', 'policy'],
  },
  {
    title: 'PS再生料市场供需失衡：收集率低与应用受限双重困境',
    summary: '聚苯乙烯（PS）因泡沫体积大、收集成本高，国内回收率不足5%，多地开始探索EPS压缩致密化改造作为破局路径，但终端应用受限问题仍待解决。',
    content: `<p>聚苯乙烯（PS/EPS）的回收利用是中国废旧塑料回收体系中最薄弱的环节之一。受制于收集难度大和终端应用受限，PS再生料市场长期处于供需双弱的困境。</p>

<h2>收集端困境</h2>
<p>EPS泡沫（俗称泡沫塑料）体积大、密度低（约0.015-0.03 g/cm³），运输成本极高，导致回收经济性差。以一辆5吨卡车为例，满载EPS泡沫的质量仅约75-150公斤，收集成本难以覆盖。</p>

<h2>破局路径：现场压缩致密化</h2>
<p>部分地区开始探索在废料产生地就地压缩EPS，将其密度提高到0.3 g/cm³以上，大幅降低运输成本。相关设备（EPS压块机）采购成本约8-15万元，回收期约2-3年。</p>

<h2>终端应用瓶颈</h2>
<p>PS再生料的应用受到限制：食品接触禁用再生PS；建筑用EPS保温板因性能要求高、认证壁垒大而难以大量使用再生料；工业包装是主要消纳渠道但需求有限。</p>

<p>业内专家呼吁，尽快建立PS再生料的产品标准和质量认证体系，打开更多终端应用场景。</p>`,
    source: '再生资源导刊',
    sourceUrl: 'https://www.chinacrr.com',
    author: '市场分析部',
    viewCount: 1650,
    publishedAt: new Date('2025-02-15'),
    tags: ['ps', 'china', 'price', 'collection'],
  },
]

async function main() {
  console.log('Seeding database...')

  // Create tags
  const createdTags: Record<string, string> = {}
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
    createdTags[tag.slug] = created.id
  }
  console.log(`Created ${tags.length} tags`)

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@plastic.com' },
    update: {},
    create: {
      email: 'admin@plastic.com',
      name: '管理员',
      passwordHash: adminHash,
      role: 'admin',
    },
  })
  console.log('Created admin user')

  // Create test user
  const testHash = await bcrypt.hash('Test@123456', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@plastic.com' },
    update: {},
    create: {
      email: 'test@plastic.com',
      name: '测试用户',
      passwordHash: testHash,
      role: 'user',
    },
  })
  console.log('Created test user')

  // Create news articles
  for (const news of newsData) {
    const { tags: tagSlugs, ...newsFields } = news
    const created = await prisma.news.create({
      data: {
        ...newsFields,
        tags: {
          create: tagSlugs.map((slug) => ({
            tag: { connect: { id: createdTags[slug] } },
          })),
        },
      },
    })
    console.log(`Created news: ${created.title.slice(0, 30)}...`)
  }

  // Create dashboards for test user
  const dashboard1 = await prisma.dashboard.create({
    data: {
      userId: testUser.id,
      name: '欧盟政策追踪',
      isDefault: false,
      tags: {
        create: [
          { tag: { connect: { id: createdTags['eu'] } } },
          { tag: { connect: { id: createdTags['policy'] } } },
        ],
      },
    },
  })

  const dashboard2 = await prisma.dashboard.create({
    data: {
      userId: testUser.id,
      name: '化学回收动态',
      isDefault: true,
      tags: {
        create: [
          { tag: { connect: { id: createdTags['chemical-recycling'] } } },
          { tag: { connect: { id: createdTags['tech-breakthrough'] } } },
          { tag: { connect: { id: createdTags['financing'] } } },
        ],
      },
    },
  })
  console.log(`Created dashboards: ${dashboard1.name}, ${dashboard2.name}`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

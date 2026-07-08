# Intelligence 精炼 — AI 提示词 & 字段规范

> 本文档供 OpenClaw / Worker `/batch-refine` 使用。
> 原始代码位置（已删除）：`src/lib/intelligence/pipeline.ts`

---

## 一、Intelligence 表字段映射

AI 精炼输出 → DB 字段对应关系：

| 字段 | 类型 | 来源 | 说明 |
|------|------|------|------|
| `title` | text | 原文 title | 原始标题，保持爬虫传入的原样 |
| `titleZh` | text | AI: `titleZh` | 中文标题，≤30字，一眼看出新闻价值 |
| `titleEn` | text | AI: `titleEn` | 英文标题，≤15 words |
| `summary` | text | AI: `refinedSummary` 前400字 | 摘要预览（SEO用） |
| `summaryZh` | text? | 与 summary 相同 | 中文摘要（源语言为中文时即为 summary） |
| `summaryEn` | text? | AI: `refinedSummary` 翻译 | 英文摘要（翻译引擎输出） |
| `content` | text | 清空 `""` | 不存原文，节省空间 |
| `contentZh` | text? | AI: `refinedSummary` 前1200字 | 中文正文 = 精炼摘要 |
| `contentEn` | text? | AI: 翻译 | 英文正文 = 翻译后的精炼摘要 |
| `tldrZh` | text? | AI: `keyInsights` 拼接 | 3-5条要点，每条以 `• ` 开头，≤30字 |
| `tldrEn` | text? | AI: 翻译 | 英文版要点，每条以 `• ` 开头，≤30 words |
| `dimension` | text? | 映射: `dimensions[0]` | 主维度（8选1的英文key） |
| `pillars` | text? | 映射: 逗号拼接 | 所有维度keys逗号分隔，如 `"recycling,recycled"` |
| `region` | text? | AI: `region` | CN\|EU\|US\|UK\|GLOBAL |
| `countryCode` | text? | 同 region | 冗余存储 |
| `importance` | int | AI: `score` | 1-5，默认3 |
| `isHot` | bool | `score >= 4` | 重要性≥4 即为热点 |
| `tags` | text[] | AI: `tags` + `dimensions` | 英文关键词+中文维度标签，去重，最多6个 |
| `category` | text? | `dimensions[0]` 中文 | 中文主维度，如 `"回收再生技术"` |
| `lang` | text | 原文检测 | `zh` 或 `en` |
| `source` | text? | 爬虫传入 | 信息源名称 |
| `sourceUrl` | text? | 爬虫传入 | 原始URL |
| `urlHash` | text | SHA256(url)前32位 | 唯一索引，去重 |
| `refineStatus` | text | `"completed"` | pending→processing→completed/failed |
| `translateStatus` | text | `"translated"` | 翻译状态 |
| `version` | int | 1 | 首次为1 |
| `publishedAt` | datetime | 爬虫传入 | 文章发布日期 |

---

## 二、维度映射表

AI 输出中文维度 → 英文 pillar key：

| 中文维度 | Pillar Key | 说明 |
|----------|------------|------|
| 模具制造 | `molds` | 模具设计/热流道/精密加工/模具钢材 |
| 成型工艺 | `molding` | 注塑/挤出/吹膜/造粒工艺与设备 |
| 再生塑料市场 | `recycled` | PCR再生料/rPET/rPP/rPE品质标准与市场价格 |
| 生物基材料 | `bio` | PLA/PHA/PBS等生物基聚合物与可降解材料 |
| 绿色助剂 | `additives` | 稳定剂/增塑剂/阻燃剂/抗氧化剂等助剂 |
| 辅料升级 | `auxiliaries` | 功能薄膜/绿色包装/表面处理等辅料 |
| 回收再生技术 | `recycling` | 机械回收/化学回收/酶解/智能分选 |
| 重复使用模式 | `reuse` | 可循环设计/减量策略/重复使用商业模式 |

兼容旧标签映射：
```
物理回收→recycling  化学回收→recycling  再生塑料→recycled
减碳→reuse          政策法规→recycling  可循环设计→reuse
行业标准→recycling  模具→molds          成型→molding
助剂→additives      辅料→auxiliaries    回收再生→recycling  重复使用→reuse
```

---

## 三、AI 系统提示词（完整）

```
你是一位专注于塑料循环经济的资深工业分析师。

【加工要求】
对原文执行以下深度加工，仅输出纯 JSON（不含 Markdown 代码块）：

{
  "titleZh": "一眼即能看出新闻价值的中文标题（不超过30字）",
  "titleEn": "Equally informative English title (max 15 words)",
  "refinedSummary": "深度总结，要求500-800字，必须涵盖：①事件背景与起因；②核心技术路径或政策细节；③对塑料产业链（原料/加工/回收/品牌商）的具体影响与机会。语气客观、专业、有深度，避免泛泛而谈。PCR/rPET/PPWR/EPR/GRS等缩写保留原文",
  "keyInsights": [
    "核心结论1，动词开头，≤30字",
    "核心结论2，动词开头，≤30字",
    "核心结论3，动词开头，≤30字"
  ],
  "dimensions": ["回收再生技术"],
  "region": "GLOBAL",
  "score": 3,
  "tags": ["rPET", "PPWR"]
}

【字段规则】
dimensions（从以下选 1-2 个，应与文章内容最匹配的维度）：
  模具制造 | 成型工艺 | 再生塑料市场 | 生物基材料 | 绿色助剂 | 辅料升级 | 回收再生技术 | 重复使用模式

维度说明：
  模具制造 = 模具设计/热流道/精密加工/模具钢材
  成型工艺 = 注塑/挤出/吹膜/造粒工艺与设备
  再生塑料市场 = PCR再生料/rPET/rPP/rPE品质标准与市场价格
  生物基材料 = PLA/PHA/PBS等生物基聚合物与可降解材料
  绿色助剂 = 稳定剂/增塑剂/阻燃剂/抗氧化剂等助剂
  辅料升级 = 功能薄膜/绿色包装/表面处理等辅料
  回收再生技术 = 机械回收/化学回收/酶解/智能分选
  重复使用模式 = 可循环设计/减量策略/重复使用商业模式

region（选 1 个）：CN | EU | US | UK | GLOBAL

score 1-5 评分标准：
  5 = 突发重磅：重大法规颁布/修订、亿级以上并购、颠覆性技术突破
  4 = 重要：行业政策调整、知名企业战略动作、大规模产能扩张
  3 = 常规：行业动态、市场数据、技术进展
  2 = 一般：企业小动态、会议预告
  1 = 低价值：宣传稿、无实质信息

keyInsights：3-5条，每条以动词开头，≤30字，聚焦具体数据或结论

tags：最多3个英文关键词，使用行业术语（如 rPET、CBAM、chemical recycling）
```

---

## 四、翻译系统提示词

### 中→英

```
You are a professional translator for the plastics circular economy industry.
Translate Chinese industry content to precise, professional English for international B2B readers.

MANDATORY TERMINOLOGY (never translate these, use exact form):
- PCR → always "PCR" (Post-Consumer Resin) in English, "PCR再生料" in Chinese
- PPWR → "PPWR" (EU Packaging and Packaging Waste Regulation)
- EPR → "EPR" (Extended Producer Responsibility) / "生产者责任延伸"
- rPET → "rPET" / "再生PET"
- rPP → "rPP" / "再生PP"
- rPE → "rPE" / "再生PE"
- Circularity → "Circularity" / "循环率"
- CBAM → "CBAM" (Carbon Border Adjustment Mechanism)
- GRS → "GRS" (Global Recycled Standard)
- Chemical recycling → "化学回收" (NOT "化学循环")
- Mechanical recycling → "机械回收" (NOT "物理回收")
- Post-consumer → "消费后" (NOT "消费者使用后")
- Post-industrial → "工业后"
- Bottle flake → "瓶片" (for rPET feed material)

Style: concise, factual, industry-standard. Avoid marketing language.
Return ONLY valid JSON with no extra text: {"titleEn": "...", "summaryEn": "..."}
```

### 英→中

```
你是塑料循环经济行业的专业翻译。
将英文行业内容翻译为精准、专业的中文，面向中国B2B读者。

[同上术语表，反转方向]

风格：简洁、客观、符合行业规范。避免营销语言。
只返回有效JSON，不要有多余文字：{"titleZh": "...", "summaryZh": "..."}
```

### TLDR 翻译

中文要点→英文：
```
Translate the following Chinese bullet points to English.
Preserve the bullet format (each starting with "•").
Keep each point concise (≤30 words).
Only output the translated bullets.
```

---

## 五、精炼 Pipeline 执行流程

```
1. generateReport(title, content, retries=3)
   → 调用 LLM，解析 JSON，校验字段
   → 失败重试3次，全部失败则降级输出

2. translateSummary(titleZh, refinedSummary, retries=2)
   ∥ translateTldr(tldrZh, retries=2)
   → 并行翻译摘要和要点

3. pipelineToDbData()
   → 映射 AI 输出到 DB 字段
   → mapDimensions() 将中文维度转为英文 pillar key
   → 合并 tags + dimensions 去重

4. 写回 DB: UPDATE Intelligence SET ... WHERE id=?
   → refineStatus = 'completed'
   → 创建 IntelligenceVersion 记录
```

## 六、降级策略

当 LLM 全部失败时使用降级输出：
```json
{
  "titleZh": "原始标题",
  "titleEn": "原始标题",
  "refinedSummary": "原文前500字",
  "keyInsights": [],
  "dimensions": ["回收再生技术"],
  "region": "GLOBAL",
  "score": 3,
  "tags": []
}
```

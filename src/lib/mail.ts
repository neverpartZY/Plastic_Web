/**
 * lib/mail.ts — Model-agnostic mail delivery 底座
 *
 * 只负责投递"信息成品"，不耦合任何 AI 生成逻辑。
 * 支持任意邮件提供商（目前使用 Resend），只需替换 MailDriver 即可。
 */

import { Resend } from 'resend'

// ── MailDriver 接口 ─────────────────────────────────────────────────────────

interface MailDriver {
  send(opts: { to: string; subject: string; html: string; from: string }): Promise<{ id: string }>
}

// ── 发件人名称（多语言）────────────────────────────────────────────────────

const FROM_NAME_ZH = '塑料循环日报'
const FROM_NAME_EN = 'Plastic Circular Daily'

function buildFrom(lang: 'zh' | 'en' = 'zh'): string {
  const emailAddr = process.env.FROM_EMAIL ?? 'daily@greenplastic.ai'
  const name = lang === 'en' ? FROM_NAME_EN : FROM_NAME_ZH
  return `${name} <${emailAddr}>`
}

// ── Resend Driver ─────────────────────────────────────────────────────────

function createResendDriver(apiKey: string): MailDriver {
  const resend = new Resend(apiKey)
  return {
    async send({ to, subject, html, from }) {
      console.log(`[mail] Sending to ${to} from ${from}, subject: ${subject}`)
      const result = await resend.emails.send({ from, to, subject, html })
      console.log(`[mail] Resend result:`, JSON.stringify(result))
      if (result.error) throw new Error(`Resend error: ${result.error.message}`)
      return { id: result.data?.id ?? 'unknown' }
    },
  }
}

// ── 全局 driver 实例（lazy init）──────────────────────────────────────────

let _driver: MailDriver | null = null

function getDriver(): MailDriver {
  if (!_driver) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY 环境变量未设置')
    _driver = createResendDriver(apiKey)
  }
  return _driver
}

// ── 公开 API ──────────────────────────────────────────────────────────────

/**
 * 发送行业邮件（只负责投递，不处理内容生成）
 *
 * @param to      收件人邮箱
 * @param subject 邮件主题
 * @param html    已渲染好的 HTML 内容
 * @param lang    语言偏好，决定发件人名称（zh: AI 情报官 / en: AI Intelligence Officer）
 */
export async function sendIndustryEmail({
  to,
  subject,
  html,
  lang = 'zh',
}: {
  to: string
  subject: string
  html: string
  lang?: 'zh' | 'en'
}): Promise<{ id: string }> {
  const from = buildFrom(lang)
  return getDriver().send({ to, subject, html, from })
}

// ── 工具函数 ─────────────────────────────────────────────────────────────

/**
 * 估算摘要（用于日志/监控，不生成内容）
 */
export function truncate(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1) + '…'
}

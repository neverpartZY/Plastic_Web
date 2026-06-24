/**
 * 统一 LLM 调用层
 * GLM-4-Flash / SiliconFlow / OpenRouter — 随机负载分配，失败自动转移
 *
 * 并发请求自然分散到不同 provider，实现并行处理。
 * 内置 token 用量追踪，支持成本可观测。
 */

// ── Token 用量追踪 ────────────────────────────────────────────────────────────

export interface TokenUsage {
  provider: string
  model: string
  operation: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  durationMs: number
  timestamp: string
}

const usageLog: TokenUsage[] = []

/** 获取当前会话所有 LLM 用量记录 */
export function getTokenUsage(): TokenUsage[] {
  return [...usageLog]
}

/** 清空用量记录（每次 pipeline 运行前调用） */
export function clearTokenUsage(): void {
  usageLog.length = 0
}

/** 获取按 provider 聚合的用量摘要 */
export function getUsageSummary(): Record<string, { calls: number; totalTokens: number; promptTokens: number; completionTokens: number }> {
  const summary: Record<string, { calls: number; totalTokens: number; promptTokens: number; completionTokens: number }> = {}
  for (const u of usageLog) {
    if (!summary[u.provider]) {
      summary[u.provider] = { calls: 0, totalTokens: 0, promptTokens: 0, completionTokens: 0 }
    }
    summary[u.provider].calls++
    summary[u.provider].totalTokens += u.totalTokens
    summary[u.provider].promptTokens += u.promptTokens
    summary[u.provider].completionTokens += u.completionTokens
  }
  return summary
}

function recordUsage(
  provider: string,
  model: string,
  operation: string,
  startMs: number,
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number },
): void {
  usageLog.push({
    provider,
    model,
    operation,
    promptTokens: usage?.prompt_tokens ?? 0,
    completionTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
    durationMs: Date.now() - startMs,
    timestamp: new Date().toISOString(),
  })
}

// ── Provider 定义 ──────────────────────────────────────────────────────────────

interface Provider {
  name: string
  url: string
  model: string
  apiKey: string
}

function getProviders(): Provider[] {
  const providers: Provider[] = []

  const glmKey = process.env.GLM_API_KEY
  if (glmKey) {
    providers.push({
      name:   'GLM',
      url:    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model:  'glm-4-flash',
      apiKey: glmKey,
    })
  }

  const sfKey = process.env.SILICONFLOW_API_KEY
  if (sfKey) {
    providers.push({
      name:   'SiliconFlow',
      url:    'https://api.siliconflow.cn/v1/chat/completions',
      model:  'THUDM/GLM-4-9B-0414',
      apiKey: sfKey,
    })
  }

  const orKey = process.env.OPENROUTER_API_KEY
  if (orKey) {
    providers.push({
      name:   'OpenRouter',
      url:    'https://openrouter.ai/api/v1/chat/completions',
      model:  'z-ai/glm-4.5-air:free',
      apiKey: orKey,
    })
  }

  return providers
}

// ── callLLM ────────────────────────────────────────────────────────────────────

async function callProvider(
  provider: Provider,
  systemPrompt: string,
  userContent: string,
  maxTokens = 512,
  operation = 'llm',
): Promise<{ text: string; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  const startMs = Date.now()

  const res = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model:       provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent },
      ],
      max_tokens:       maxTokens,
      temperature:      0.2,
      // Qwen3 系列默认开启思考模式，关闭可大幅降低延迟
      ...(provider.name === 'SiliconFlow' ? { enable_thinking: false } : {}),
      // z-ai/glm-4.5-air 默认开启推理，关闭以避免 token 浪费
      ...(provider.name === 'OpenRouter' ? { reasoning: { enabled: false } } : {}),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`${provider.name} API error ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const text: string = data?.choices?.[0]?.message?.content ?? ''
  const usage = {
    prompt_tokens:      data?.usage?.prompt_tokens      ?? 0,
    completion_tokens:  data?.usage?.completion_tokens  ?? 0,
    total_tokens:       data?.usage?.total_tokens       ?? 0,
  }

  // 记录 token 用量
  recordUsage(provider.name, provider.model, operation, startMs, usage)

  return { text: text.trim(), usage }
}

/**
 * 调用 LLM — 随机负载分配，失败自动转移下一个
 * @param prefer  优先使用指定 provider，不传则随机分散负载
 * @param operation 操作标签（用于 token 用量追踪），默认 "llm"
 */
export async function callLLM(
  systemPrompt: string,
  userContent: string,
  maxTokens = 512,
  prefer?: string,
  operation?: string,
): Promise<string> {
  const providers = getProviders()
  if (providers.length === 0) throw new Error('No LLM API key configured')

  // 指定 provider → 优先用它，失败再尝试其他
  let order: Provider[]
  if (prefer) {
    const preferred = providers.find(p => p.name === prefer)
    const rest = providers.filter(p => p.name !== prefer)
    order = preferred ? [preferred, ...rest] : providers
  } else {
    // 随机起始，并发请求自然分散到不同 provider
    const start = Math.floor(Math.random() * providers.length)
    order = [...providers.slice(start), ...providers.slice(0, start)]
  }

  // 生成操作标签（未指定时自动推断）
  const op = operation ?? 'llm'

  let lastErr: unknown
  for (const provider of order) {
    try {
      const { text, usage } = await callProvider(provider, systemPrompt, userContent, maxTokens, op)
      console.log(`[LLM] ${provider.name} responded (${usage.total_tokens} tokens)`)
      return text
    } catch (err) {
      console.warn(`[LLM] ${provider.name} failed, next: ${String(err).slice(0, 100)}`)
      lastErr = err
    }
  }

  throw lastErr
}

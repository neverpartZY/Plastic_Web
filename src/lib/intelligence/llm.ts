/**
 * 统一 LLM 调用层
 * 主力：GLM-4-Flash（智谱 AI）
 * 备用：SiliconFlow（硅基流动）— 设置 SILICONFLOW_API_KEY 后自动启用
 *
 * 两者均兼容 OpenAI Chat Completions 格式，负载按轮询分配。
 */

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
      model:  'Qwen/Qwen2.5-7B-Instruct',
      apiKey: sfKey,
    })
  }

  return providers
}

// 简单轮询计数器（进程内共享）
let rrIndex = 0

async function callProvider(
  provider: Provider,
  systemPrompt: string,
  userContent: string,
  maxTokens = 512,
): Promise<string> {
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
      max_tokens:  maxTokens,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`${provider.name} API error ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json()
  const text: string = data?.choices?.[0]?.message?.content ?? ''
  return text.trim()
}

/**
 * 调用 LLM，自动负载均衡 + 失败转移
 * @param systemPrompt  系统提示词
 * @param userContent   用户内容
 * @param maxTokens     最大输出 token 数
 */
export async function callLLM(
  systemPrompt: string,
  userContent: string,
  maxTokens = 512,
): Promise<string> {
  const providers = getProviders()
  if (providers.length === 0) throw new Error('No LLM API key configured (GLM_API_KEY or SILICONFLOW_API_KEY)')

  // 轮询选主，失败后尝试下一个
  const start = rrIndex % providers.length
  rrIndex++

  const order = [
    ...providers.slice(start),
    ...providers.slice(0, start),
  ]

  let lastErr: unknown
  for (const provider of order) {
    try {
      return await callProvider(provider, systemPrompt, userContent, maxTokens)
    } catch (err) {
      console.warn(`[LLM] ${provider.name} failed, trying next: ${err}`)
      lastErr = err
    }
  }

  throw lastErr
}

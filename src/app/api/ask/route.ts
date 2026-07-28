/**
 * POST /api/ask
 * AI 查询窗口 — 搜索 IMA "国嘉基业·LLM Wiki" 知识库
 */
import { NextRequest, NextResponse } from 'next/server'

const KB_ID = 'cbS6_lBGSoDYC6oH9t2e-7yN6SbUQkGodQAstAulh5s='
const IMA_API = 'https://ima.qq.com/openapi/wiki/v1/search_knowledge'

function getCreds() {
  const clientId = process.env.IMA_OPENAPI_CLIENTID
  const apiKey = process.env.IMA_OPENAPI_APIKEY
  if (!clientId || !apiKey) {
    throw new Error('IMA credentials not configured')
  }
  return { clientId, apiKey }
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string' || query.trim().length < 1) {
      return NextResponse.json({ error: '请输入搜索内容' }, { status: 400 })
    }

    const { clientId, apiKey } = getCreds()

    // 调 IMA 知识库搜索
    const imaRes = await fetch(IMA_API, {
      method: 'POST',
      headers: {
        'ima-openapi-clientid': clientId,
        'ima-openapi-apikey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        knowledge_base_id: KB_ID,
        limit: 10,
      }),
    })

    const imaData = await imaRes.json()

    if (imaData.code !== 0) {
      return NextResponse.json({
        error: imaData.msg || '搜索失败',
        results: [],
      })
    }

    const items = imaData.data?.knowledge_list || []

    // 对每条搜索结果获取摘要（如果 title + snippet 不够有用，可额外调 get_media_info）
    const results = items.map((item: any) => ({
      title: item.title || '',
      snippet: item.snippet || '',
      mediaId: item.media_id || '',
      mediaType: item.media_type || 0,
      score: item.score || 0,
      url: item.url || '',
    }))

    return NextResponse.json({ results })
  } catch (e: any) {
    console.error('[ask] error:', e.message)
    return NextResponse.json({ error: e.message || '请求失败' }, { status: 500 })
  }
}

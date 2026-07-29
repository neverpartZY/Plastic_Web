/**
 * POST /api/ask
 * AI 查询窗口 — 三步流程：搜索 IMA → 获取媒体信息 → 签名下载内容
 */
import { NextRequest, NextResponse } from 'next/server'

const KB_ID = 'cbS6_lBGSoDYC6oH9t2e-7yN6SbUQkGodQAstAulh5s='
const IMA_BASE = 'https://ima.qq.com'

function getCreds() {
  const clientId = process.env.IMA_OPENAPI_CLIENTID
  const apiKey = process.env.IMA_OPENAPI_APIKEY
  if (!clientId || !apiKey) throw new Error('IMA credentials not configured')
  return { clientId, apiKey }
}

function headers(creds: { clientId: string; apiKey: string }) {
  return {
    'ima-openapi-clientid': creds.clientId,
    'ima-openapi-apikey': creds.apiKey,
    'Content-Type': 'application/json',
  }
}

async function callIMA(creds: any, apiPath: string, body: any) {
  const res = await fetch(`${IMA_BASE}/${apiPath}`, {
    method: 'POST',
    headers: headers(creds),
    body: JSON.stringify(body),
  })
  return res.json()
}

// 从 HTML 中提取纯文本
function extractText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// 可读的媒体类型
const READABLE_TYPES = new Set([1, 7, 11, 12]) // PDF, Markdown, 笔记

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string' || query.trim().length < 1) {
      return NextResponse.json({ error: '请输入搜索内容' }, { status: 400 })
    }

    const creds = getCreds()

    // 步骤1：搜索知识库 — 原查询优先，0 结果时自动降级
    const rawQuery = query.trim()

    const doSearch = async (q: string) => {
      return callIMA(creds, 'openapi/wiki/v1/search_knowledge', {
        query: q,
        knowledge_base_id: KB_ID,
        limit: 10,
      })
    }

    let searchData = await doSearch(rawQuery)

    // 降级策略：原查询 0 结果时，用核心关键词重试
    if (searchData.code === 0 && (searchData.data?.info_list?.length ?? 0) === 0 && rawQuery.length > 6) {
      // 去掉常见虚词前缀（最新的、最近的、2026年、2025年等时间+虚词）
      const fallbackQuery = rawQuery.replace(/^(最新[的]?|最近[的]?|当前[的]?|\d{4}年[的]?)\s*/, '').trim()
      if (fallbackQuery && fallbackQuery !== rawQuery) {
        searchData = await doSearch(fallbackQuery)
      }
    }

    if (searchData.code !== 0) {
      return NextResponse.json({ error: searchData.msg || '搜索失败', results: [] })
    }

    const items = searchData.data?.info_list || searchData.data?.knowledge_list || []

    // 步骤2+3：获取媒体信息 → 下载内容
    const results = []
    for (const item of items.slice(0, 5)) {
      const result: any = {
        title: item.title || '',
        snippet: item.highlight_content || item.snippet || '',
        mediaId: item.media_id || '',
        mediaType: item.media_type || 0,
        content: '',
      }

      try {
        const info = await callIMA(creds, 'openapi/wiki/v1/get_media_info', {
          media_id: item.media_id,
        })

        if (info.code === 0 && info.data?.url_info?.url) {
          const { url, headers: signHeaders } = info.data.url_info

          // 下载内容
          const dlRes = await fetch(url, { headers: signHeaders || {} })
          if (dlRes.ok) {
            const raw = await dlRes.text()
            result.content = raw.length > 2000 ? raw.slice(0, 2000) + '...' : raw

            // 如果是 HTML，提取纯文本
            if (raw.trim().startsWith('<')) {
              result.content = extractText(raw).slice(0, 2000)
            }
          }
        }
      } catch (e: any) {
        console.error(`[ask] failed to fetch content for ${item.media_id}: ${e.message}`)
      }

      results.push(result)
    }

    return NextResponse.json({ results, total: items.length })
  } catch (e: any) {
    console.error('[ask] error:', e.message)
    return NextResponse.json({ error: e.message || '请求失败' }, { status: 500 })
  }
}

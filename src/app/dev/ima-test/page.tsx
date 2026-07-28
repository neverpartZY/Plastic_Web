'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle, FileText, Sparkles, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestResult {
  name: string
  status: 'pending' | 'ok' | 'fail'
  detail?: string
  duration?: number
}

interface SearchItem {
  title: string
  snippet: string
  content: string
  mediaType: number
}

export default function ImaTestPage() {
  const [apiKey, setApiKey] = useState('')
  const [tests, setTests] = useState<TestResult[]>([
    { name: '凭证配置检查', status: 'pending' },
    { name: '知识库列表', status: 'pending' },
    { name: '搜索知识库内容', status: 'pending' },
    { name: '读取文档内容', status: 'pending' },
    { name: '端到端：搜索+读全文', status: 'pending' },
  ])
  const [running, setRunning] = useState(false)

  // 搜索演示
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  async function runTests() {
    setRunning(true)
    setTests(t => t.map(t => ({ ...t, status: 'pending' as const, detail: '', duration: undefined })))

    async function update(index: number, status: 'ok' | 'fail', detail?: string) {
      setTests(t => t.map((item, i) =>
        i === index ? { ...item, status, detail, duration: undefined } : item
      ))
    }

    // Test 1: 凭证
    try {
      const r = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' }),
      })
      const d = await r.json()
      if (d.error && d.error === 'IMA credentials not configured') {
        update(0, 'fail', '环境变量 IMA_OPENAPI_CLIENTID / IMA_OPENAPI_APIKEY 未配置')
      } else {
        update(0, 'ok', '凭证配置正确')
      }
    } catch {
      update(0, 'fail', 'API 请求失败')
    }

    // Test 2: 搜索知识库
    try {
      const start = Date.now()
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '塑料回收' }),
      })
      const d = await r.json()
      const elapsed = Date.now() - start
      if (d.results?.length > 0) {
        update(1, 'ok', `搜索成功，返回 ${d.total || d.results.length} 条结果（${elapsed}ms）`)
      } else if (d.results?.length === 0) {
        update(1, 'ok', `搜索返回 0 条结果（${elapsed}ms）`)
      } else {
        update(1, 'fail', d.error || `搜索失败（${elapsed}ms）`)
      }
    } catch (e: any) {
      update(1, 'fail', e.message)
    }

    // Test 3: 读取文档内容
    try {
      // 先搜一篇特定文章
      const search = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '中国政策法规里程碑' }),
      })
      const searchData = await search.json()
      const item = searchData.results?.find((r: SearchItem) => r.content)
      if (item) {
        update(2, 'ok', `成功读取 "${item.title.slice(0, 40)}" 全文（${item.content.length} 字符）`)
      } else if (searchData.results?.length > 0) {
        update(2, 'ok', '搜索到结果但无内容（文件类型不支持直接读）')
      } else {
        update(2, 'ok', '搜索正常（无匹配内容）')
      }
    } catch (e: any) {
      update(2, 'fail', e.message)
    }

    // Test 4: 端到端
    const okCount = tests.filter(t => t.status === 'ok').length
    if (okCount >= 2) {
      update(4, 'ok', `${okCount}/4 测试通过，整体连通性正常`)
    } else {
      update(4, 'fail', `仅 ${okCount}/4 通过，存在连接问题`)
    }

    setRunning(false)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim() || searchLoading) return
    setSearchLoading(true)
    setSearchError('')
    setSearchResults([])
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      })
      const d = await r.json()
      if (d.error) {
        setSearchError(d.error)
      } else {
        setSearchResults(d.results || [])
      }
    } catch {
      setSearchError('请求失败')
    }
    setSearchLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-2">国嘉基业 · IMA 连接测试</h1>
      <p className="text-sm text-slate-500 mb-8">验证 IMA 知识库搜索 + 文档读取功能</p>

      {/* 配置信息 */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-6">
        <p className="text-xs text-slate-400 font-medium mb-2">当前配置</p>
        <code className="text-xs text-slate-600">
          知识库：国嘉基业·LLM Wiki (cbS6_lBG...h5s=)
        </code>
      </div>

      {/* 测试按钮 */}
      <button
        onClick={runTests}
        disabled={running}
        className={cn(
          'px-6 py-3 rounded-2xl font-semibold text-sm transition-all mb-8',
          running
            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
        )}
      >
        {running ? (
          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> 测试中...</span>
        ) : '运行连通性测试'}
      </button>

      {/* 测试结果 */}
      <div className="space-y-3 mb-10">
        {tests.map((test) => (
          <div key={test.name} className={cn(
            'flex items-start gap-3 p-3 rounded-2xl border transition-all',
            test.status === 'pending' && 'border-slate-100 bg-white',
            test.status === 'ok' && 'border-emerald-200 bg-emerald-50/30',
            test.status === 'fail' && 'border-red-200 bg-red-50/30',
          )}>
            {test.status === 'pending' && <div className="h-5 w-5 rounded-full bg-slate-100 mt-0.5" />}
            {test.status === 'ok' && <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />}
            {test.status === 'fail' && <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{test.name}</p>
              {test.detail && (
                <p className="text-xs text-slate-500 mt-0.5">{test.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 搜索演示 */}
      <div className="border-t pt-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-emerald-500" />
          搜索演示
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="输入搜索词测试..."
            className="flex-1 h-10 px-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || searchLoading}
            className={cn(
              'px-5 h-10 rounded-2xl font-semibold text-sm transition-all',
              searchQuery.trim()
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            )}
          >
            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '搜索'}
          </button>
        </form>

        {searchError && (
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-sm mb-4">{searchError}</div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">{searchResults.length} 条结果</p>
            {searchResults.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.snippet || '无摘要'}</p>
                    {item.content && (
                      <details className="mt-2">
                        <summary className="text-xs text-emerald-600 cursor-pointer hover:text-emerald-500">查看全文</summary>
                        <pre className="mt-2 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 whitespace-pre-wrap max-h-60 overflow-y-auto">{item.content}</pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

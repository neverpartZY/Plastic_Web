'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2, ChevronRight, Sparkles, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  title: string
  snippet: string
  mediaId: string
  score: number
}

export default function AiSearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    if (!open) {
      setQuery('')
      setResults([])
      setError('')
    }
  }, [open])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const q = query.trim()
    if (!q || loading) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.results || [])
      }
    } catch {
      setError('搜索请求失败')
    }
    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl mx-4 rounded-3xl bg-white overflow-hidden',
          'shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25)]',
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-3 border-b border-slate-100">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-900">国嘉基业 · AI 知识库</p>
            <p className="text-[11px] text-slate-400">基于 IMA 知识库的智能搜索</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 pt-3 pb-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex-1 flex items-center rounded-2xl border border-emerald-200 bg-emerald-50/50 focus-within:border-emerald-400 focus-within:bg-emerald-50 transition-all">
              <Search className="h-4 w-4 ml-3 text-emerald-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="搜索塑料循环经济知识库..."
                className="flex-1 h-10 bg-transparent px-3 text-[14px] focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setResults([]); setError('') }}
                  className="h-10 w-8 flex items-center justify-center text-slate-300 hover:text-slate-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className={cn(
                'h-10 px-5 rounded-2xl font-semibold text-[13px] transition-all flex items-center gap-1.5',
                query.trim()
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed',
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  搜索 <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="px-4 pb-4 max-h-[50vh] overflow-y-auto">
          {error && (
            <div className="py-8 text-center">
              <p className="text-[13px] text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && query && (
            <div className="py-12 text-center">
              <Search className="h-8 w-8 mx-auto text-slate-200 mb-3" />
              <p className="text-[13px] text-slate-400">未找到相关结果</p>
              <p className="text-[11px] text-slate-300 mt-1">试试换个关键词</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-[11px] text-slate-400 font-medium px-1">
                找到 {results.length} 条结果
              </p>
              {results.map((item, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-emerald-50/50 transition-colors cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-200 transition-colors">
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 line-clamp-2">
                      {item.title}
                    </p>
                    {item.snippet && (
                      <p className="text-[12px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!query && !loading && (
            <div className="py-12 text-center">
              <Sparkles className="h-10 w-10 mx-auto text-emerald-200 mb-3" />
              <p className="text-[13px] text-slate-400">输入问题，搜索国嘉基业知识库</p>
              <p className="text-[11px] text-slate-300 mt-1">例如：PPWR对再生含量有什么要求？</p>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto text-emerald-400 animate-spin mb-3" />
              <p className="text-[13px] text-slate-400">正在搜索知识库...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

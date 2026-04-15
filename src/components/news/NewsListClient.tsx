'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Filter, SlidersHorizontal, Settings2, Layers, FlaskConical, Box, RefreshCw, BarChart3, Globe2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useFilterStore } from '@/store/filterStore'
import { useDebounce } from '@/hooks/useDebounce'
import TagFilter from './TagFilter'
import NewsCard from './NewsCard'
import NewsCardSkeleton from './NewsCardSkeleton'
import type { NewsListItem, PaginatedResponse, TagsByCategory } from '@/types'

// ── Six pillar definitions ────────────────────────────────────────────────────

const PILLARS = [
  { key: 'machinery',    label: '绿色机械',    icon: Settings2,   active: 'bg-blue-100 text-blue-700 border-blue-300',    rest: 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700' },
  { key: 'materials',    label: '可持续材料',  icon: Layers,       active: 'bg-teal-100 text-teal-700 border-teal-300',    rest: 'bg-white text-slate-600 border-slate-200 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700' },
  { key: 'additives',    label: '环保助剂',    icon: FlaskConical, active: 'bg-violet-100 text-violet-700 border-violet-300', rest: 'bg-white text-slate-600 border-slate-200 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700' },
  { key: 'auxiliaries',  label: '绿色辅料',    icon: Box,          active: 'bg-amber-100 text-amber-700 border-amber-300',   rest: 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700' },
  { key: 'recycling',    label: '循环再生',    icon: RefreshCw,    active: 'bg-emerald-100 text-emerald-700 border-emerald-300', rest: 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700' },
  { key: 'carbonPolicy', label: '碳中和/政策', icon: BarChart3,    active: 'bg-indigo-100 text-indigo-700 border-indigo-300', rest: 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700' },
]

const REGIONS = [
  { key: '',              label: '全部地区' },
  { key: 'china',         label: '中国' },
  { key: 'asia-pacific',  label: '亚太' },
  { key: 'europe',        label: '欧洲' },
  { key: 'north-america', label: '北美' },
  { key: 'global',        label: '全球' },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  tagsByCategory: TagsByCategory
  initialData: PaginatedResponse<NewsListItem>
  initialTags?: string[]
  initialSort?: string
  initialQ?: string
  initialPillar?: string
  initialRegion?: string
}

export default function NewsListClient({
  tagsByCategory,
  initialData,
  initialTags = [],
  initialSort = 'latest',
  initialQ = '',
  initialPillar = '',
  initialRegion = '',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { selectedTags, sortBy, currentPage, searchQuery, toggleTag, setTags, clearAll, setSort, setPage, setSearch } =
    useFilterStore()

  const [data, setData] = useState<PaginatedResponse<NewsListItem>>(initialData)
  const [loading, setLoading] = useState(false)
  const [activePillar, setActivePillar] = useState(initialPillar)
  const [activeRegion, setActiveRegion] = useState(initialRegion)

  const debouncedQuery = useDebounce(searchQuery, 400)

  // Initialize from URL params
  useEffect(() => {
    setTags(initialTags)
    setSort(initialSort as 'latest' | 'popular')
    setSearch(initialQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch news on any filter change
  const fetchNews = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedTags.length) params.set('tags', selectedTags.join(','))
    if (sortBy !== 'latest') params.set('sort', sortBy)
    if (currentPage > 1) params.set('page', String(currentPage))
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (activePillar) params.set('pillar', activePillar)
    if (activeRegion) params.set('region', activeRegion)

    // Update URL without navigation
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })

    try {
      params.set('limit', '12')
      const res = await fetch(`/api/news?${params}`)
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }, [selectedTags, sortBy, currentPage, debouncedQuery, activePillar, activeRegion, router, pathname])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  function togglePillar(key: string) {
    setActivePillar(prev => prev === key ? '' : key)
    setPage(1)
  }

  function selectRegion(key: string) {
    setActiveRegion(key)
    setPage(1)
  }

  function clearAllFilters() {
    clearAll()
    setActivePillar('')
    setActiveRegion('')
  }

  const CATEGORY_COLORS: Record<string, string> = {
    material: 'bg-blue-100 text-blue-800',
    process: 'bg-green-100 text-green-800',
    technology: 'bg-purple-100 text-purple-800',
    region: 'bg-amber-100 text-amber-800',
    topic: 'bg-red-100 text-red-800',
  }

  const allTags = Object.values(tagsByCategory).flat()
  const hasActiveFilters = selectedTags.length > 0 || activePillar || activeRegion || searchQuery

  return (
    <div>

      {/* ════════════ Intelligence Filter Bar ════════════ */}
      <div className="border-b border-slate-100 bg-white sticky top-16 z-30">
        <div className="container py-3 space-y-2.5">

          {/* ── Row 1: Six Pillar Filter ── */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em] whitespace-nowrap flex-shrink-0">
              支柱
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {PILLARS.map(({ key, label, icon: Icon, active, rest }) => {
                const isActive = activePillar === key
                return (
                  <button
                    key={key}
                    onClick={() => togglePillar(key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[12px] font-semibold whitespace-nowrap transition-all duration-150',
                      isActive ? active : rest,
                    )}
                  >
                    <Icon className="h-3 w-3 flex-shrink-0" />
                    {label}
                    {isActive && <X className="h-2.5 w-2.5 ml-0.5 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Row 2: Region Filter + clear ── */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em] whitespace-nowrap flex-shrink-0">
                地区
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {REGIONS.map(({ key, label }) => {
                  const isActive = activeRegion === key
                  return (
                    <button
                      key={key || 'all'}
                      onClick={() => selectRegion(key)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1.5 rounded-2xl border text-[12px] font-medium whitespace-nowrap transition-all duration-150',
                        isActive
                          ? 'bg-cyan-100 text-cyan-700 border-cyan-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700',
                      )}
                    >
                      {key === '' && <Globe2 className="h-3 w-3 flex-shrink-0" />}
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11.5px] font-medium text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-colors flex-shrink-0"
              >
                <X className="h-3 w-3" />
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ════════════ Main list area ════════════ */}
      <div className="container py-6">
        <div className="flex gap-6">

          {/* Desktop sidebar filter */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-40 rounded-xl border bg-card p-4 shadow-sm">
              <TagFilter
                tagsByCategory={tagsByCategory}
                selectedTags={selectedTags}
                onToggle={toggleTag}
                onClear={clearAll}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Mobile filter trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-1" />
                    标签筛选
                    {selectedTags.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary text-white text-xs w-4 h-4 flex items-center justify-center">
                        {selectedTags.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle>标签筛选</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <TagFilter
                      tagsByCategory={tagsByCategory}
                      selectedTags={selectedTags}
                      onToggle={toggleTag}
                      onClear={clearAll}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search */}
              <Input
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索关键词..."
                className="h-8 w-40 sm:w-52"
              />

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSort(v as 'latest' | 'popular')}>
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">最新发布</SelectItem>
                    <SelectItem value="popular">最多浏览</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter summary */}
            {(selectedTags.length > 0 || activePillar || activeRegion) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {activePillar && (() => {
                  const p = PILLARS.find(p => p.key === activePillar)
                  if (!p) return null
                  const Icon = p.icon
                  return (
                    <button
                      key={activePillar}
                      onClick={() => setActivePillar('')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 cursor-pointer hover:bg-cyan-200 transition-colors"
                    >
                      <Icon className="h-3 w-3" />
                      {p.label}
                      <span className="text-xs">×</span>
                    </button>
                  )
                })()}
                {activeRegion && (() => {
                  const r = REGIONS.find(r => r.key === activeRegion)
                  if (!r) return null
                  return (
                    <button
                      key={activeRegion}
                      onClick={() => setActiveRegion('')}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 cursor-pointer hover:bg-cyan-200 transition-colors"
                    >
                      <Globe2 className="h-3 w-3" />
                      {r.label}
                      <span className="text-xs">×</span>
                    </button>
                  )
                })()}
                {selectedTags.map((slug) => {
                  const tag = allTags.find((t) => t.slug === slug)
                  if (!tag) return null
                  return (
                    <button
                      key={slug}
                      onClick={() => toggleTag(slug)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${CATEGORY_COLORS[tag.category] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {tag.name}
                      <span className="text-xs">×</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
              共 <span className="font-medium text-foreground">{data.total}</span> 条结果
              {activePillar && (
                <span className="ml-2 text-cyan-600 font-medium">
                  · {PILLARS.find(p => p.key === activePillar)?.label}
                </span>
              )}
              {activeRegion && (
                <span className="ml-2 text-cyan-600 font-medium">
                  · {REGIONS.find(r => r.key === activeRegion)?.label}
                </span>
              )}
            </p>

            {/* News grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            ) : data.items.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg mb-2">暂无相关新闻</p>
                <p className="text-sm">尝试调整筛选条件或搜索关键词</p>
                <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                  清除筛选
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.items.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                  上一页
                </Button>
                {Array.from({ length: Math.min(data.totalPages, 7) }).map((_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(page)}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  )
                })}
                <Button variant="outline" size="sm" disabled={currentPage >= data.totalPages} onClick={() => setPage(currentPage + 1)}>
                  下一页
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

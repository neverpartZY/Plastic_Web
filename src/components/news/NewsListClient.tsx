'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { useFilterStore } from '@/store/filterStore'
import { useDebounce } from '@/hooks/useDebounce'
import TagFilter from './TagFilter'
import NewsCard from './NewsCard'
import NewsCardSkeleton from './NewsCardSkeleton'
import type { NewsListItem, PaginatedResponse, TagsByCategory } from '@/types'

interface Props {
  tagsByCategory: TagsByCategory
  initialData: PaginatedResponse<NewsListItem>
  initialTags?: string[]
  initialSort?: string
  initialQ?: string
}

export default function NewsListClient({
  tagsByCategory,
  initialData,
  initialTags = [],
  initialSort = 'latest',
  initialQ = '',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { selectedTags, sortBy, currentPage, searchQuery, toggleTag, setTags, clearAll, setSort, setPage, setSearch } =
    useFilterStore()

  const [data, setData] = useState<PaginatedResponse<NewsListItem>>(initialData)
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounce(searchQuery, 400)

  // Initialize from URL params
  useEffect(() => {
    setTags(initialTags)
    setSort(initialSort as 'latest' | 'popular')
    setSearch(initialQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch news on filter/sort/page change
  const fetchNews = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedTags.length) params.set('tags', selectedTags.join(','))
    if (sortBy !== 'latest') params.set('sort', sortBy)
    if (currentPage > 1) params.set('page', String(currentPage))
    if (debouncedQuery) params.set('q', debouncedQuery)

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
  }, [selectedTags, sortBy, currentPage, debouncedQuery, router, pathname])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const CATEGORY_COLORS: Record<string, string> = {
    material: 'bg-blue-100 text-blue-800',
    process: 'bg-green-100 text-green-800',
    technology: 'bg-purple-100 text-purple-800',
    region: 'bg-amber-100 text-amber-800',
    topic: 'bg-red-100 text-red-800',
  }

  const allTags = Object.values(tagsByCategory).flat()

  return (
    <div className="container py-6">
      <div className="flex gap-6">
        {/* Desktop sidebar filter */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 rounded-xl border bg-card p-4 shadow-sm">
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
                  筛选
                  {selectedTags.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary text-white text-xs w-4 h-4 flex items-center justify-center">
                      {selectedTags.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>筛选标签</SheetTitle>
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

          {/* Active tag pills */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
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
              <Button variant="outline" className="mt-4" onClick={clearAll}>
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
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
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
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= data.totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

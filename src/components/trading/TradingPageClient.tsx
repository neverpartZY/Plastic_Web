'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus, Package, Search, Zap, RefreshCw } from 'lucide-react'
import ListingCard from './ListingCard'
import PublishForm from './PublishForm'
import MatchCard from './MatchCard'

interface Listing {
  id: number; type: string; material: string; form: string; quantity: number; price: number
  priceNegotiable: number; location: string; specs: string; notes: string
  wasteOrRecycled: string; status: string; createdAt: string
}
interface Price {
  id: number; category: string; material: string; priceAvg: number; priceLow: number
  priceHigh: number; trend: string; changePct: number; updatedAt: string
}
interface Stats { totalSupplies: number; totalDemands: number; totalMatches: number; activeUsers: number }
interface Match {
  id: number; score: number; status: string; dimensionScores: Record<string, number>
  supply_material: string; supply_form: string; supply_quantity: number; supply_price: number; supply_location: string
  supply_user_name: string; supply_user_role: string
  demand_material: string; demand_form: string; demand_quantity: number; demand_price: number; demand_location: string
  demand_user_name: string; demand_user_role: string
}

type Tab = 'supply' | 'demand' | 'prices' | 'publish' | 'match'

const CATEGORIES = ['全部', 'PET', 'PP', 'HDPE', 'LDPE', 'ABS', 'PC', 'PS', 'PVC', 'PA6']
const TYPE_OPTIONS = ['全部', '废塑料', '再生料']

export default function TradingPageClient({ lang, dict }: { lang: 'zh' | 'en'; dict: any }) {
  const [tab, setTab] = useState<Tab>('supply')
  const [listings, setListings] = useState<Listing[]>([])
  const [prices, setPrices] = useState<Price[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [wasteType, setWasteType] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [matchPhone, setMatchPhone] = useState('')
  const [matchLoading, setMatchLoading] = useState(false)
  const LIMIT = 15

  useEffect(() => {
    fetch('/api/trading/stats').then(r => r.json()).then(d => { if (d.success) setStats(d.stats) }).catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'prices') {
        const p = new URLSearchParams()
        if (category) p.set('category', category.toUpperCase())
        const res = await fetch('/api/trading/prices?' + p.toString())
        const d = await res.json(); if (d.success) setPrices(d.prices)
      } else if (tab === 'supply' || tab === 'demand') {
        const p = new URLSearchParams()
        p.set('type', tab); p.set('limit', String(LIMIT)); p.set('page', String(page))
        if (category) p.set('material', category)
        if (wasteType) p.set('wasteOrRecycled', wasteType)
        const res = await fetch('/api/trading/listings?' + p.toString())
        const d = await res.json(); if (d.success) { setListings(d.listings); setTotal(d.total) }
      }
    } finally { setLoading(false) }
  }, [tab, category, wasteType, page])

  useEffect(() => { fetchData() }, [fetchData])

  async function searchMatches() {
    if (!matchPhone) return
    setMatchLoading(true)
    try {
      // Find user by phone
      const uRes = await fetch('/api/trading/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', phone: matchPhone }) })
      const uData = await uRes.json()
      if (!uData.success) { setMatches([]); setMatchLoading(false); return }

      const mRes = await fetch(`/api/trading/matches/${uData.user.id}`)
      const mData = await mRes.json()
      setMatches(mData.success ? mData.matches : [])
    } finally { setMatchLoading(false) }
  }

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
    if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
    return <Minus className="h-3.5 w-3.5 text-gray-400" />
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="container py-6">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '供应', value: stats.totalSupplies, color: 'text-emerald-600' },
            { label: '需求', value: stats.totalDemands, color: 'text-blue-600' },
            { label: '撮合', value: stats.totalMatches, color: 'text-purple-600' },
            { label: '用户', value: stats.activeUsers, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-white rounded-xl border p-1 w-fit flex-wrap">
        {[
          { key: 'supply' as Tab, label: '供应列表', icon: Package },
          { key: 'demand' as Tab, label: '需求列表', icon: Search },
          { key: 'prices' as Tab, label: '行情价格', icon: TrendingUp },
          { key: 'publish' as Tab, label: '发布信息', icon: Zap },
          { key: 'match' as Tab, label: '智能撮合', icon: RefreshCw },
        ].map(t => (
          <button key={t.key}
            onClick={() => { setTab(t.key); setPage(1); setCategory(''); setWasteType('') }}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters (listings & prices only) */}
      {['supply', 'demand', 'prices'].includes(tab) && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {tab === 'prices' ? (
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c === '全部' ? '' : c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    (c === '全部' && !category) || category === c ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}>{c}</button>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c === '全部' ? '' : c)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      (c === '全部' && !category) || category === c ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                    }`}>{c}</button>
                ))}
              </div>
              <div className="w-px bg-gray-200 h-6" />
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map(t => (
                  <button key={t} onClick={() => setWasteType(t === '全部' ? '' : t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      (t === '全部' && !wasteType) || wasteType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>{t}</button>
                ))}
              </div>
            </>
          )}
          <span className="text-xs text-gray-400 ml-auto">{tab !== 'prices' ? `${total} 条` : `${prices.length} 条`}</span>
        </div>
      )}

      {/* Content */}
      {tab === 'publish' ? (
        <PublishForm onPublished={() => { fetchData(); fetch('/api/trading/stats').then(r => r.json()).then(d => { if (d.success) setStats(d.stats) }) }} />
      ) : tab === 'match' ? (
        <div className="space-y-4">
          {/* Phone search */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">🔍 查询我的匹配</h3>
            <p className="text-xs text-gray-500 mb-3">输入发布时填写的手机号，查看系统自动为您撮合的结果</p>
            <div className="flex items-center gap-3">
              <input className="w-64 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                value={matchPhone} onChange={e => setMatchPhone(e.target.value)} placeholder="输入手机号" />
              <button onClick={searchMatches} disabled={matchLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                {matchLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                查询匹配
              </button>
            </div>
          </div>

          {/* Match results */}
          {matchPhone && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">匹配结果</span>
                <span className="px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-600 font-medium">{matches.length} 条</span>
              </div>
              {matches.length === 0 ? (
                <div className="bg-white rounded-xl border p-10 text-center text-gray-400">暂无匹配结果。发布信息后系统会自动撮合。</div>
              ) : (
                <div className="space-y-3">
                  {matches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              )}
            </div>
          )}
        </div>
      ) : tab === 'prices' ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">品类</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">品种</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">均价</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">最低</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">最高</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">趋势</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">涨跌</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-16 text-gray-400">加载中...</td></tr>
              : prices.length === 0 ? <tr><td colSpan={7} className="text-center py-16 text-gray-400">暂无数据</td></tr>
              : prices.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{p.category}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{p.material}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">¥{p.priceAvg.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">¥{p.priceLow.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">¥{p.priceHigh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{trendIcon(p.trend)}</td>
                  <td className={`px-4 py-3 text-right text-sm font-semibold ${p.changePct > 0 ? 'text-rose-500' : p.changePct < 0 ? 'text-emerald-500' : 'text-gray-400'}`}>{p.changePct > 0 ? '+' : ''}{p.changePct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {loading ? <div className="text-center py-20 text-gray-400">加载中...</div>
          : listings.length === 0 ? <div className="text-center py-20 text-gray-400"><Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />暂无{tab === 'supply' ? '供应' : '需求'}信息</div>
          : <div className="space-y-3">{listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}</div>}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-sm border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">上一页</button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-sm border bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List, MapPin, BadgeCheck, Star, Zap, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompanyItem } from './page'

// ── Dimension labels — light-mode palette ─────────────────────────────────────

const ENTITY_TYPES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  equipment: { label: '装备制造', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  additive:  { label: '助剂研发', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  mold:      { label: '精密模具', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  process:   { label: '处理工艺', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  material:  { label: '再生材料', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
}

const APP_DOMAINS: Record<string, { label: string; color: string; bg: string }> = {
  automotive:   { label: '汽车工业',   color: '#dc2626', bg: '#fef2f2' },
  electronics:  { label: '消费电子',   color: '#2563eb', bg: '#eff6ff' },
  packaging:    { label: '包装材料',   color: '#059669', bg: '#ecfdf5' },
  construction: { label: '建筑建材',   color: '#d97706', bg: '#fffbeb' },
  medical:      { label: '医疗器械',   color: '#7c3aed', bg: '#f5f3ff' },
  agriculture:  { label: '农业应用',   color: '#16a34a', bg: '#f0fdf4' },
}

const ALL_ENTITIES = ['全部', ...Object.keys(ENTITY_TYPES)]

// ── Company Card — white theme ────────────────────────────────────────────────

function CompanyCard({ company }: { company: CompanyItem }) {
  const entity = ENTITY_TYPES[company.entityType]
  const domain = APP_DOMAINS[company.appDomain]

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 hover:-translate-y-1">
      <div className="p-5 md:p-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Logo circle */}
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-base font-black ring-4"
            style={{
              background: entity?.bg ?? '#f8fafc',
              color: entity?.color ?? '#475569',
              ringColor: entity?.border ?? '#e2e8f0',
              border: `2px solid ${entity?.border ?? '#e2e8f0'}`,
            }}
          >
            {company.name.charAt(0)}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {company.isPremium && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                <Star className="h-2.5 w-2.5" /> 精选
              </span>
            )}
            {company.isVerified && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                <BadgeCheck className="h-2.5 w-2.5" /> 认证
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-emerald-700 transition-colors">
          {company.name}
        </h3>

        {/* Description */}
        {company.description && (
          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {company.description}
          </p>
        )}

        {/* X / Y axis tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {entity && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
              style={{ background: entity.bg, color: entity.color, borderColor: entity.border }}>
              X · {entity.label}
            </span>
          )}
          {domain && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
              style={{ background: domain.bg, color: domain.color, borderColor: domain.color + '40' }}>
              Y · {domain.label}
            </span>
          )}
        </div>

        {/* Metrics + location */}
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-3">
            {company.capacity != null && (
              <div>
                <span className="text-slate-900 font-semibold">{(company.capacity / 10000).toFixed(1)}万</span>
                <span className="text-slate-400 ml-0.5">吨/年</span>
              </div>
            )}
            {company.recycleRate != null && (
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${company.recycleRate}%` }} />
                </div>
                <span className="text-emerald-600 font-semibold">{company.recycleRate}%</span>
              </div>
            )}
          </div>
          {(company.province || company.city) && (
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3" />
              <span>{company.city ?? company.province}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── List Row — white theme ────────────────────────────────────────────────────

function CompanyRow({ company }: { company: CompanyItem }) {
  const entity = ENTITY_TYPES[company.entityType]
  const domain = APP_DOMAINS[company.appDomain]

  return (
    <div className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:border-emerald-200 hover:shadow-emerald-50 transition-all duration-200">
      {/* Logo circle */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border-2"
        style={{ background: entity?.bg ?? '#f8fafc', color: entity?.color ?? '#475569', borderColor: entity?.border ?? '#e2e8f0' }}>
        {company.name.charAt(0)}
      </div>

      {/* Name + city */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
            {company.name}
          </span>
          {company.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />}
          {company.isPremium && <Star className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
        </div>
        {company.city && (
          <div className="flex items-center gap-1 text-[12px] text-slate-400 mt-0.5">
            <MapPin className="h-2.5 w-2.5" />
            {company.city}
          </div>
        )}
      </div>

      {/* X / Y tags */}
      <div className="hidden sm:flex items-center gap-2">
        {entity && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full border font-semibold"
            style={{ background: entity.bg, color: entity.color, borderColor: entity.border }}>
            {entity.label}
          </span>
        )}
        {domain && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
            style={{ background: domain.bg, color: domain.color }}>
            {domain.label}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="hidden md:flex items-center gap-5 text-[12px]">
        {company.capacity != null && (
          <div className="text-right">
            <div className="text-slate-900 font-bold">{(company.capacity / 10000).toFixed(1)}万吨</div>
            <div className="text-slate-400">处理能力</div>
          </div>
        )}
        {company.recycleRate != null && (
          <div className="text-right">
            <div className="text-emerald-600 font-bold">{company.recycleRate}%</div>
            <div className="text-slate-400">回收率</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ExploreClient({ companies }: { companies: CompanyItem[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [entityFilter, setEntityFilter] = useState('全部')
  const [domainFilter, setDomainFilter] = useState('全部')
  const [searchQ, setSearchQ] = useState('')

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (entityFilter !== '全部' && c.entityType !== entityFilter) return false
      if (domainFilter !== '全部' && c.appDomain !== domainFilter) return false
      if (searchQ) {
        const q = searchQ.toLowerCase()
        if (!c.name.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [companies, entityFilter, domainFilter, searchQ])

  const activeCount = (entityFilter !== '全部' ? 1 : 0) + (domainFilter !== '全部' ? 1 : 0)

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-24 pb-16 bg-gradient-to-br from-white via-cyan-50/50 to-teal-50/20">
        <div className="absolute top-0 right-1/4 w-[600px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.018] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.9) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>发现资源</span><span>/</span>
            <span className="text-cyan-700 font-medium">产业地图</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            X-Y轴标签 · 行业坐标系
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">产业地图</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            以实体维度（X轴）与应用领域（Y轴）双坐标定位产业链企业，精准发现上下游合作伙伴
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { label: '收录企业', value: `${companies.length}+` },
              { label: 'X轴实体类型', value: Object.keys(ENTITY_TYPES).length.toString() },
              { label: 'Y轴应用领域', value: Object.keys(APP_DOMAINS).length.toString() },
              { label: '认证企业', value: `${companies.filter(c => c.isVerified).length}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <div className="text-2xl font-black text-cyan-700">{value}</div>
                <div className="text-[12px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      {/* ── Filters + Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">

        {/* Sticky filter bar — white */}
        <div className="sticky top-16 z-20 py-4 bg-white/95 backdrop-blur-sm border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

            {/* Left: search + X-axis filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="搜索企业..."
                  className="pl-8 pr-3 py-1.5 text-[13px] rounded-xl outline-none w-36 text-slate-900 placeholder-slate-400 focus:w-48 focus:border-emerald-400 transition-all border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-100"
                />
                {searchQ && (
                  <button onClick={() => setSearchQ('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="h-3 w-3 text-slate-400 hover:text-slate-700" />
                  </button>
                )}
              </div>

              {/* X axis pills */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] text-slate-400 font-semibold">X轴:</span>
                {ALL_ENTITIES.map((e) => {
                  const et = ENTITY_TYPES[e]
                  const isActive = entityFilter === e
                  return (
                    <button
                      key={e}
                      onClick={() => setEntityFilter(e)}
                      className={cn(
                        'text-[11px] px-2.5 py-1 rounded-xl font-semibold transition-all duration-150 border',
                        isActive
                          ? 'border-transparent'
                          : 'text-slate-500 hover:text-slate-700 border-slate-200 bg-white hover:bg-slate-50',
                      )}
                      style={isActive ? {
                        background: et?.bg ?? '#f1f5f9',
                        color: et?.color ?? '#0f172a',
                        borderColor: et?.border ?? '#e2e8f0',
                      } : undefined}
                    >
                      {e === '全部' ? '全部' : et?.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right: Y-axis dropdown + view toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-semibold">Y轴:</span>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="text-[12px] px-2.5 py-1.5 rounded-xl text-slate-900 outline-none border border-slate-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="全部">全部领域</option>
                  {Object.entries(APP_DOMAINS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              {activeCount > 0 && (
                <button
                  onClick={() => { setEntityFilter('全部'); setDomainFilter('全部'); setSearchQ('') }}
                  className="text-[11px] px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  清除 ({activeCount})
                </button>
              )}

              {/* View toggle */}
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-1.5 transition-colors', viewMode === 'grid' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-1.5 transition-colors', viewMode === 'list' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Result count */}
          <div className="mt-2 text-[12px] text-slate-400">
            显示 <span className="text-slate-700 font-semibold">{filtered.length}</span> 家企业
            {filtered.length !== companies.length && ` (共 ${companies.length} 家)`}
          </div>
        </div>

        {/* Company grid / list */}
        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <Zap className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-[15px]">没有匹配的企业</p>
              <button onClick={() => { setEntityFilter('全部'); setDomainFilter('全部'); setSearchQ('') }}
                className="mt-3 text-[13px] text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
                清除筛选条件
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((c) => <CompanyCard key={c.id} company={c} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((c) => <CompanyRow key={c.id} company={c} />)}
            </div>
          )}
        </div>

        {/* Axis legend */}
        <div className="mt-14 p-7 rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-xl shadow-slate-100">
          <h3 className="text-[13px] font-bold text-slate-700 mb-5">坐标系说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-[12px] text-cyan-700 font-bold mb-3">X轴 · 实体维度（企业是什么）</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ENTITY_TYPES).map(([k, v]) => (
                  <span key={k} className="text-[11px] px-2.5 py-1 rounded-full font-semibold border"
                    style={{ background: v.bg, color: v.color, borderColor: v.border }}>
                    {v.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-emerald-600 font-bold mb-3">Y轴 · 应用领域（企业服务谁）</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(APP_DOMAINS).map(([k, v]) => (
                  <span key={k} className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: v.bg, color: v.color }}>
                    {v.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

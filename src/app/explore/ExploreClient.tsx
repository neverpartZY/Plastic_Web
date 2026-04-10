'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, List, MapPin, BadgeCheck, Star, Zap, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompanyItem } from './page'

// ── Dimension labels ──────────────────────────────────────────────────────────

const ENTITY_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  equipment: { label: '装备制造', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  additive:  { label: '助剂研发', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
  mold:      { label: '精密模具', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
  process:   { label: '处理工艺', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  material:  { label: '再生材料', color: '#67e8f9', bg: 'rgba(6,182,212,0.12)' },
}

const APP_DOMAINS: Record<string, { label: string; color: string }> = {
  automotive:   { label: '汽车工业', color: '#f87171' },
  electronics:  { label: '消费电子', color: '#60a5fa' },
  packaging:    { label: '包装材料', color: '#34d399' },
  construction: { label: '建筑建材', color: '#fbbf24' },
  medical:      { label: '医疗器械', color: '#c084fc' },
  agriculture:  { label: '农业应用', color: '#86efac' },
}

const ALL_ENTITIES = ['全部', ...Object.keys(ENTITY_TYPES)]
const ALL_DOMAINS  = ['全部', ...Object.keys(APP_DOMAINS)]

// ── Company Card ─────────────────────────────────────────────────────────────

function CompanyCard({ company, compact }: { company: CompanyItem; compact?: boolean }) {
  const entity = ENTITY_TYPES[company.entityType]
  const domain = APP_DOMAINS[company.appDomain]

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.border = '1px solid rgba(16,185,129,0.30)'
        el.style.boxShadow = '0 0 32px rgba(16,185,129,0.10), 0 16px 40px rgba(0,0,0,0.45)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.border = '1px solid rgba(255,255,255,0.08)'
        el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      {/* Premium glow */}
      {company.isPremium && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 60%)' }} />
      )}

      <div className={compact ? 'p-4' : 'p-5 md:p-6'}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Logo placeholder */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
            style={{
              background: entity ? `linear-gradient(135deg, ${entity.bg.replace('0.12', '0.3')}, ${entity.bg})` : 'rgba(255,255,255,0.08)',
              color: entity?.color ?? '#fff',
              boxShadow: entity ? `0 4px 12px ${entity.bg}` : undefined,
            }}
          >
            {company.name.charAt(0)}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {company.isPremium && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
                <Star className="h-2.5 w-2.5" /> 精选
              </span>
            )}
            {company.isVerified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.22)' }}>
                <BadgeCheck className="h-2.5 w-2.5" /> 认证
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-[15px] font-bold text-white/90 mb-1.5 leading-snug">{company.name}</h3>

        {/* Description */}
        {company.description && (
          <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2 mb-4">
            {company.description}
          </p>
        )}

        {/* Axis tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {entity && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: entity.bg, color: entity.color }}>
              X · {entity.label}
            </span>
          )}
          {domain && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.07)', color: domain.color }}>
              Y · {domain.label}
            </span>
          )}
        </div>

        {/* Metrics + Location */}
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-3">
            {company.capacity != null && (
              <div>
                <span className="text-white/80 font-semibold">{(company.capacity / 10000).toFixed(1)}万</span>
                <span className="text-slate-500 ml-0.5">吨/年</span>
              </div>
            )}
            {company.recycleRate != null && (
              <div className="flex items-center gap-1">
                <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${company.recycleRate}%` }} />
                </div>
                <span className="text-emerald-400 font-semibold">{company.recycleRate}%</span>
              </div>
            )}
          </div>
          {(company.province || company.city) && (
            <div className="flex items-center gap-1 text-slate-500">
              <MapPin className="h-3 w-3" />
              <span>{company.city ?? company.province}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── List Row ──────────────────────────────────────────────────────────────────

function CompanyRow({ company }: { company: CompanyItem }) {
  const entity = ENTITY_TYPES[company.entityType]
  const domain = APP_DOMAINS[company.appDomain]

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
    >
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
        style={{ background: entity?.bg ?? 'rgba(255,255,255,0.08)', color: entity?.color ?? '#fff' }}>
        {company.name.charAt(0)}
      </div>

      {/* Name + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-white/90 truncate">{company.name}</span>
          {company.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
          {company.isPremium && <Star className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />}
        </div>
        {company.city && (
          <div className="flex items-center gap-1 text-[12px] text-slate-500 mt-0.5">
            <MapPin className="h-2.5 w-2.5" />
            {company.city}
          </div>
        )}
      </div>

      {/* X / Y tags */}
      <div className="hidden sm:flex items-center gap-2">
        {entity && (
          <span className="text-[11px] px-2 py-0.5 rounded-md"
            style={{ background: entity.bg, color: entity.color }}>{entity.label}</span>
        )}
        {domain && (
          <span className="text-[11px] px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.07)', color: domain.color }}>{domain.label}</span>
        )}
      </div>

      {/* Metrics */}
      <div className="hidden md:flex items-center gap-4 text-[12px]">
        {company.capacity != null && (
          <div className="text-right">
            <div className="text-white/80 font-semibold">{(company.capacity / 10000).toFixed(1)}万吨</div>
            <div className="text-slate-500">处理能力</div>
          </div>
        )}
        {company.recycleRate != null && (
          <div className="text-right">
            <div className="text-emerald-400 font-semibold">{company.recycleRate}%</div>
            <div className="text-slate-500">回收率</div>
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
    <div style={{ background: 'linear-gradient(180deg, #020a14 0%, #07111f 60%, #f8fafc 100%)' }}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-10 pb-16">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>发现资源</span><span>/</span>
            <span className="text-blue-400 font-medium">产业地图</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-blue-500/25 bg-blue-500/8 text-blue-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            X-Y轴标签 · 行业坐标系
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">产业地图</h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed">
            以实体维度（X轴）与应用领域（Y轴）双坐标定位产业链企业，精准发现上下游合作伙伴
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { label: '收录企业', value: `${companies.length}+` },
              { label: 'X轴实体类型', value: Object.keys(ENTITY_TYPES).length.toString() },
              { label: 'Y轴应用领域', value: Object.keys(APP_DOMAINS).length.toString() },
              { label: '认证企业', value: `${companies.filter(c => c.isVerified).length}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-[12px] text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters + Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20" style={{ background: 'transparent' }}>

        {/* Filter bar */}
        <div className="sticky top-16 z-20 py-4"
          style={{ background: 'rgba(7,17,31,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            {/* Left: filters */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="搜索企业..."
                  className="pl-8 pr-3 py-1.5 text-[13px] rounded-lg outline-none w-36 text-white/90 placeholder-slate-600 focus:w-48 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="h-3 w-3 text-slate-500 hover:text-white" />
                  </button>
                )}
              </div>

              {/* X axis filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 font-semibold">X轴:</span>
                {ALL_ENTITIES.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEntityFilter(e)}
                    className={cn(
                      'text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all duration-150',
                      entityFilter === e
                        ? 'text-blue-300'
                        : 'text-slate-500 hover:text-slate-300',
                    )}
                    style={entityFilter === e
                      ? { background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.30)' }
                      : { background: 'transparent', border: '1px solid transparent' }}
                  >
                    {e === '全部' ? '全部' : ENTITY_TYPES[e]?.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Y axis + view toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 font-semibold">Y轴:</span>
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="text-[12px] px-2 py-1.5 rounded-lg text-white/90 outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <option value="全部" style={{ background: '#0f172a' }}>全部领域</option>
                  {Object.entries(APP_DOMAINS).map(([k, v]) => (
                    <option key={k} value={k} style={{ background: '#0f172a' }}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Active filter count */}
              {activeCount > 0 && (
                <button
                  onClick={() => { setEntityFilter('全部'); setDomainFilter('全部'); setSearchQ('') }}
                  className="text-[11px] px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  清除 ({activeCount})
                </button>
              )}

              {/* View toggle */}
              <div className="flex rounded-lg overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-1.5 transition-colors', viewMode === 'grid' ? 'bg-white/12 text-white' : 'text-slate-500 hover:text-slate-300')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-1.5 transition-colors', viewMode === 'list' ? 'bg-white/12 text-white' : 'text-slate-500 hover:text-slate-300')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Result count */}
          <div className="mt-2 text-[12px] text-slate-500">
            显示 <span className="text-white/70 font-semibold">{filtered.length}</span> 家企业
            {filtered.length !== companies.length && ` (共 ${companies.length} 家)`}
          </div>
        </div>

        {/* Company grid / list */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-[15px]">没有匹配的企业</p>
              <button onClick={() => { setEntityFilter('全部'); setDomainFilter('全部'); setSearchQ('') }}
                className="mt-3 text-[13px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                清除筛选条件
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((c) => <CompanyCard key={c.id} company={c} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((c) => <CompanyRow key={c.id} company={c} />)}
            </div>
          )}
        </div>

        {/* Axis legend */}
        <div className="mt-12 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-[13px] font-semibold text-slate-400 mb-4">坐标系说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-[12px] text-blue-400 font-semibold mb-2">X轴 · 实体维度（企业是什么）</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ENTITY_TYPES).map(([k, v]) => (
                  <span key={k} className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: v.bg, color: v.color }}>{v.label}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-amber-400 font-semibold mb-2">Y轴 · 应用领域（企业服务谁）</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(APP_DOMAINS).map(([k, v]) => (
                  <span key={k} className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                    style={{ background: 'rgba(255,255,255,0.07)', color: v.color }}>{v.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

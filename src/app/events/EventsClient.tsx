'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import {
  Calendar, MapPin, Users, Clock, CheckCircle2,
  Ticket, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { registerEvent, type ActionState } from '@/app/services/actions'
import {
  DarkModal, DarkField, DarkSubmitButton, FormFeedback,
} from '@/components/ui/DarkModal'

// ── Mock events ───────────────────────────────────────────────────────────────

const EVENT_TYPES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  conference:  { label: '行业峰会', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  exhibition:  { label: '专业展览', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  seminar:     { label: '专题研讨', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  workshop:    { label: '技术工坊', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
}

interface EventItem {
  id: string
  title: string
  description: string
  eventType: string
  location: string
  city: string
  startDate: string
  endDate: string
  capacity: number
  registered: number
  status: 'open' | 'full' | 'closed' | 'soon'
  isPremium: boolean
  highlight?: string
}

const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-001',
    title: '2026中国塑料循环产业高峰论坛',
    description: '汇聚政策制定者、头部企业与投资机构，共同研判行业格局与未来5年发展机遇。设主旨演讲、圆桌对话、项目路演三大板块，预计出席嘉宾逾600人。',
    eventType: 'conference', location: '北京国际会议中心', city: '北京',
    startDate: '2026-05-15', endDate: '2026-05-16',
    capacity: 600, registered: 482, status: 'open', isPremium: true,
    highlight: '年度最重要行业盛会',
  },
  {
    id: 'evt-002',
    title: '华南再生塑料交易博览会',
    description: '聚焦华南区域再生料贸易与技术对接，设原料交易、装备展示、供需洽谈三大专区，是华南地区规模最大的再生塑料专业展览。',
    eventType: 'exhibition', location: '广州琶洲国际会展中心', city: '广州',
    startDate: '2026-06-03', endDate: '2026-06-05',
    capacity: 1500, registered: 830, status: 'open', isPremium: false,
  },
  {
    id: 'evt-003',
    title: 'PCR塑料食品包装合规专题研讨会',
    description: '深度解析EU 2022/1616与FDA 21 CFR最新要求，邀请认证机构、品牌采购方与材料供应商共同探讨合规落地路径，设案例分析与问答环节。',
    eventType: 'seminar', location: '上海张江国际创新中心', city: '上海',
    startDate: '2026-05-22', endDate: '2026-05-22',
    capacity: 120, registered: 118, status: 'full', isPremium: true,
  },
  {
    id: 'evt-004',
    title: '注塑机智能化升级技术工坊',
    description: '实操型工坊，涵盖IoT传感器接入、MES数据采集、能耗优化调参三个模块，限额30人确保互动质量，提供标杆工厂参观环节。',
    eventType: 'workshop', location: '宁波工业设计创意园', city: '宁波',
    startDate: '2026-05-29', endDate: '2026-05-30',
    capacity: 30, registered: 21, status: 'open', isPremium: false,
  },
  {
    id: 'evt-005',
    title: '2026亚太塑料绿色转型国际展览会',
    description: '亚洲最大规模的绿色塑料专业展览，来自亚太12个国家逾2000家企业参展，涵盖机械装备、改性材料、检测认证、化学回收等全产业链展区。',
    eventType: 'exhibition', location: '上海国家会展中心', city: '上海',
    startDate: '2026-09-10', endDate: '2026-09-13',
    capacity: 5000, registered: 0, status: 'soon', isPremium: false,
    highlight: '即将开放报名',
  },
  {
    id: 'evt-006',
    title: '产业链供应商大会——再生料质量标准联席会议',
    description: '聚焦再生料品质检测标准统一问题，邀请头部品牌方、检测机构与分拣企业共同制定行业自律规范，探讨建立全国统一认证体系的路径。',
    eventType: 'seminar', location: '深圳前海深港协同创新中心', city: '深圳',
    startDate: '2026-07-08', endDate: '2026-07-08',
    capacity: 80, registered: 34, status: 'open', isPremium: true,
  },
]

// ── Register form ─────────────────────────────────────────────────────────────

const IDLE: ActionState = { status: 'idle' }

function RegisterForm({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const [state, formAction] = useFormState(registerEvent, IDLE)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId"    value={event.id} />
      <input type="hidden" name="eventTitle" value={event.title} />

      {/* Event summary */}
      <div className="px-4 py-3 rounded-xl space-y-1.5 bg-slate-50 border border-slate-200">
        <p className="text-[13px] font-semibold text-slate-900 leading-snug">{event.title}</p>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.startDate}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.city}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DarkField label="姓名" name="name" required placeholder="您的姓名" />
        <DarkField label="公司" name="company" placeholder="所在单位" hint="选填" />
      </div>
      <DarkField label="邮箱" name="email" type="email" required placeholder="确认函发送邮箱" />
      <DarkField label="手机" name="phone" placeholder="联系电话" hint="选填" />
      <div>
        <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">
          参会人数<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <select name="attendees" required
          className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-900 outline-none appearance-none border border-slate-200 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>{n} 人</option>
          ))}
        </select>
      </div>

      <FormFeedback state={state} />
      {state.status !== 'success' && <DarkSubmitButton label="确认报名" accentColor="#f59e0b" />}
      {state.status === 'success' && (
        <button type="button" onClick={onClose}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 border border-slate-200 hover:bg-slate-50">
          关闭
        </button>
      )}
    </form>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EventItem['status'] }) {
  const cfg = {
    open:   { label: '报名中',   className: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    full:   { label: '已满员',   className: 'bg-rose-50 border-rose-200 text-rose-600' },
    closed: { label: '已截止',   className: 'bg-slate-100 border-slate-200 text-slate-500' },
    soon:   { label: '即将开放', className: 'bg-amber-50 border-amber-200 text-amber-700' },
  }[status]
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.className)}>
      {cfg.label}
    </span>
  )
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({ event, onRegister }: { event: EventItem; onRegister: (e: EventItem) => void }) {
  const type = EVENT_TYPES[event.eventType]
  const pct = Math.round((event.registered / event.capacity) * 100)
  const canRegister = event.status === 'open'

  return (
    <div className="group relative overflow-hidden rounded-3xl flex flex-col transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200">
      {/* Top accent */}
      <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${type.color}, ${type.color}88)` }} />

      {/* Highlight ribbon */}
      {event.highlight && (
        <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold"
          style={{ background: type.bg, borderBottom: `1px solid ${type.border}`, color: type.color }}>
          <Sparkles className="h-3 w-3" /> {event.highlight}
        </div>
      )}

      <div className="p-6 md:p-7 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border"
              style={{ background: type.bg, color: type.color, borderColor: type.border }}>{type.label}</span>
            <StatusBadge status={event.status} />
            {event.isPremium && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">会员专属</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3 flex-1">
          {event.description}
        </p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-y-2 text-[12px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{event.startDate}{event.endDate !== event.startDate && ` — ${event.endDate}`}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{event.city} · {event.location.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>容量 {event.capacity.toLocaleString()} 人</span>
          </div>
          {event.registered > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>已报名 {event.registered}</span>
            </div>
          )}
        </div>

        {/* Capacity bar */}
        {event.registered > 0 && (
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>报名进度</span>
              <span style={{ color: pct >= 90 ? '#e11d48' : type.color }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: pct >= 90 ? '#e11d48' : type.color }} />
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => canRegister && onRegister(event)}
          disabled={!canRegister}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200',
            canRegister ? 'text-white hover:brightness-105' : 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400',
          )}
          style={canRegister
            ? { background: type.color, boxShadow: `0 4px 14px ${type.color}30` }
            : undefined}
        >
          {event.status === 'full'   ? <><CheckCircle2 className="h-4 w-4" /> 名额已满</> :
           event.status === 'closed' ? '报名已截止' :
           event.status === 'soon'   ? <><Clock className="h-4 w-4" /> 即将开放</> :
           <><Ticket className="h-4 w-4" /> 立即报名</>}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EventsClient() {
  const [target, setTarget] = useState<EventItem | null>(null)
  const [filter, setFilter] = useState('全部')

  const filtered = filter === '全部' ? MOCK_EVENTS : MOCK_EVENTS.filter(e => e.eventType === filter)

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-24 pb-20 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/20">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>行业服务</span><span>/</span>
            <span className="text-amber-600 font-medium">会展活动</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            峰会 · 展览 · 工坊
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">会展活动</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            汇聚行业峰会、专业展览与技术工坊，链接供需两端，促进产业资源高效流动
          </p>

          <div className="flex flex-wrap gap-8 mt-8">
            {[
              { icon: Calendar, label: '年度活动', value: `${MOCK_EVENTS.length}+` },
              { icon: Users,    label: '预计参会', value: '7,000+' },
              { icon: MapPin,   label: '覆盖城市', value: '12' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 ring-4 ring-amber-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{value}</div>
                  <div className="text-[12px] text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-32">
        {/* Filter tabs */}
        <div className="sticky top-16 z-20 py-3 mb-6 bg-white/95 backdrop-blur-sm border-b border-slate-100">
          <div className="flex gap-2 flex-wrap items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {['全部', ...Object.keys(EVENT_TYPES)].map((key) => {
                const t = EVENT_TYPES[key]
                const isActive = filter === key
                return (
                  <button key={key} onClick={() => setFilter(key)}
                    className={cn('text-[12px] px-3 py-1.5 rounded-lg font-semibold transition-all border',
                      isActive
                        ? 'border-transparent'
                        : 'text-slate-500 hover:text-slate-700 bg-transparent border-transparent hover:border-slate-200 hover:bg-slate-50'
                    )}
                    style={isActive
                      ? { background: t ? t.bg : '#f1f5f9', color: t?.color ?? '#0f172a', borderColor: t?.border ?? '#e2e8f0' }
                      : undefined}>
                    {key === '全部' ? `全部 (${MOCK_EVENTS.length})` : t.label}
                  </button>
                )
              })}
            </div>
            <span className="text-[12px] text-slate-400">{filtered.length} 场活动</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ev) => (
            <EventCard key={ev.id} event={ev} onRegister={setTarget} />
          ))}
        </div>
      </div>

      {/* ── Register modal ── */}
      <DarkModal
        open={!!target}
        onClose={() => setTarget(null)}
        title="活动报名"
        description="报名成功后确认函将发送至您的邮箱"
        accentColor="#f59e0b"
        accentIcon={<Ticket className="h-4 w-4" style={{ color: '#d97706' }} />}
      >
        {target && <RegisterForm event={target} onClose={() => setTarget(null)} />}
      </DarkModal>

    </div>
  )
}

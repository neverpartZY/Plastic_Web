'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import {
  Users, BadgeCheck, Building2, Globe, ArrowRight,
  Star, Handshake, BookOpen, Newspaper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { joinAssociation, requestReport, type ActionState } from '@/app/services/actions'
import {
  DarkModal, DarkField, DarkSelect, DarkTextarea,
  DarkSubmitButton, FormFeedback,
} from '@/components/ui/DarkModal'

// ── Mock data ─────────────────────────────────────────────────────────────────

const MEMBER_TIERS = [
  {
    tier: '理事单位',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    textColor: '#92400e',
    perks: ['参与年度战略研讨', '优先获取研究报告', '理事会投票权', '品牌曝光位'],
    price: '¥50,000 / 年',
  },
  {
    tier: '普通会员',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    textColor: '#1e40af',
    perks: ['参与会员活动', '报告折扣订阅', '会员目录展示', '行业资讯推送'],
    price: '¥8,000 / 年',
  },
  {
    tier: '观察成员',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    textColor: '#065f46',
    perks: ['参与公开论坛', '月度简报订阅', '活动优先通知'],
    price: '免费',
  },
]

const MEMBERS = [
  { name: '蓝星再生科技', tier: '理事单位', city: '宁波', type: '分拣处理', verified: true },
  { name: '绿循新材料集团', tier: '理事单位', city: '深圳', type: '化学回收', verified: true },
  { name: '太空聚合工艺', tier: '普通会员', city: '上海', type: '酶解技术', verified: true },
  { name: '康健医塑循环', tier: '普通会员', city: '北京', type: '医疗废塑', verified: true },
  { name: '晶聚高分子技术', tier: '普通会员', city: '苏州', type: '改性助剂', verified: false },
  { name: '循建新型建材', tier: '普通会员', city: '武汉', type: '建筑材料', verified: false },
  { name: '海岸守护装备', tier: '观察成员', city: '青岛', type: '分选装备', verified: true },
  { name: '优策精密模具', tier: '观察成员', city: '台州', type: '精密模具', verified: false },
]

const REPORTS = [
  { id: 'r1', title: '2026年中国汽车塑料轻量化与循环利用蓝皮书', category: '行业白皮书', pages: 128, date: '2026-04-01', tier: 'premium' },
  { id: 'r2', title: '消费电子塑料闭环回收体系建设指南（2026版）', category: '技术指南', pages: 96, date: '2026-03-18', tier: 'premium' },
  { id: 'r3', title: '食品接触级再生塑料合规认证实操手册', category: '合规手册', pages: 72, date: '2026-03-05', tier: 'premium' },
  { id: 'r4', title: '再生塑料行业2026年Q1季度市场观察', category: '市场报告', pages: 42, date: '2026-04-08', tier: 'free' },
]

// ── Forms ─────────────────────────────────────────────────────────────────────

const IDLE: ActionState = { status: 'idle' }

function JoinForm({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState(joinAssociation, IDLE)
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DarkField label="姓名" name="name" required placeholder="您的称呼" />
        <DarkField label="公司" name="company" placeholder="所在单位" hint="选填" />
      </div>
      <DarkField label="邮箱" name="email" type="email" required placeholder="工作邮箱" />
      <DarkField label="手机" name="phone" placeholder="联系电话" hint="选填" />
      <DarkSelect label="申请类型" name="role" required>
        <option value="">请选择入会身份</option>
        <option value="director">理事单位</option>
        <option value="member">普通会员</option>
        <option value="observer">观察成员</option>
      </DarkSelect>
      <DarkTextarea label="入会说明" name="message" placeholder="简要介绍贵司业务与入会目的（选填）" />
      <FormFeedback state={state} />
      {state.status !== 'success' && (
        <DarkSubmitButton label="提交入会申请" accentColor="#7c3aed" />
      )}
      {state.status === 'success' && (
        <button type="button" onClick={onClose}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 border border-slate-200">
          关闭
        </button>
      )}
    </form>
  )
}

function ReportForm({ title, onClose }: { title: string; onClose: () => void }) {
  const [state, formAction] = useFormState(requestReport, IDLE)
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="reportTitle" value={title} />
      <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-600">
        <span className="text-slate-900 font-semibold">索取报告：</span>{title}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DarkField label="姓名" name="name" required placeholder="您的称呼" />
        <DarkField label="公司" name="company" placeholder="所在单位" hint="选填" />
      </div>
      <DarkField label="邮箱" name="email" type="email" required placeholder="报告将发送至此邮箱" />
      <DarkTextarea label="索取原因" name="reason" placeholder="简述使用场景，有助于我们提供定制内容（选填）" />
      <FormFeedback state={state} />
      {state.status !== 'success' && <DarkSubmitButton label="提交索取申请" accentColor="#6366f1" />}
      {state.status === 'success' && (
        <button type="button" onClick={onClose}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 border border-slate-200">
          关闭
        </button>
      )}
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssociationClient() {
  const [joinOpen, setJoinOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<string | null>(null)

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-24 pb-20 bg-gradient-to-br from-white via-violet-50/40 to-purple-50/20">
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>行业服务</span><span>/</span>
            <span className="text-violet-600 font-medium">行业协会</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            产业联盟 · 互信生态
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">行业协会</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed mb-8">
            汇聚塑料回收产业链上下游核心企业，通过标准制定、技术交流、政策倡导，构建产业互信生态网络
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setJoinOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 hover:brightness-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', boxShadow: '0 4px 20px rgba(139,92,246,0.25)' }}
            >
              <Handshake className="h-4 w-4" /> 申请入会
            </button>
            <a href="#reports"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-slate-700 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:border-slate-300 shadow-sm">
              <BookOpen className="h-4 w-4" /> 浏览研究报告
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: Building2, label: '成员单位', value: '200+' },
              { icon: Globe,     label: '覆盖城市', value: '38' },
              { icon: Star,      label: '理事单位', value: '26' },
              { icon: Newspaper, label: '发布报告', value: '94' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 ring-4 ring-violet-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-violet-600" />
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-32 space-y-20">

        {/* ── Membership tiers ── */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">会员体系</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MEMBER_TIERS.map((tier) => (
              <div key={tier.tier}
                className="rounded-3xl p-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 border shadow-xl shadow-slate-100"
                style={{ background: tier.bg, borderColor: tier.border }}>
                <div>
                  <span className="text-[12px] font-bold px-2.5 py-1 rounded-full border"
                    style={{ background: 'white', color: tier.color, borderColor: tier.border }}>
                    {tier.tier}
                  </span>
                  <div className="mt-3 text-xl font-bold" style={{ color: tier.color }}>{tier.price}</div>
                </div>
                <ul className="space-y-2 flex-1">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[13px] text-slate-700">
                      <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: tier.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setJoinOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-all hover:brightness-95 border"
                  style={{ background: 'white', color: tier.color, borderColor: tier.border }}>
                  立即申请 <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Member directory ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">成员目录</h2>
            <span className="text-[12px] text-slate-400">共 {MEMBERS.length} 家展示</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MEMBERS.map((m) => {
              const tierInfo = MEMBER_TIERS.find(t => t.tier === m.tier)
              return (
                <div key={m.name}
                  className="p-5 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-xl shadow-slate-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border"
                    style={{ background: tierInfo?.bg ?? '#f8fafc', color: tierInfo?.color ?? '#475569', borderColor: tierInfo?.border ?? '#e2e8f0' }}>
                    {m.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-slate-900 truncate">{m.name}</span>
                      {m.verified && <BadgeCheck className="h-3 w-3 text-emerald-600 flex-shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.city} · {m.type}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Research reports ── */}
        <section id="reports">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">研究报告</h2>
            <a href="/think-tank" className="flex items-center gap-1 text-[13px] text-violet-600 hover:text-violet-700 transition-colors">
              查看全部 <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPORTS.map((r) => (
              <div key={r.id}
                className="group flex items-start gap-4 p-6 rounded-3xl transition-all duration-200 hover:-translate-y-0.5 bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200">
                <div className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', border: '1px solid #c4b5fd' }}>
                  <BookOpen className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 border border-indigo-100 text-indigo-600">{r.category}</span>
                    {r.tier === 'premium' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-50 border border-amber-200 text-amber-700">会员专享</span>
                    )}
                  </div>
                  <h3 className="text-[13px] font-semibold text-slate-900 leading-snug mb-1 line-clamp-2 group-hover:text-violet-700 transition-colors">{r.title}</h3>
                  <div className="text-[11px] text-slate-400">{r.date} · {r.pages}页</div>
                </div>
                <button
                  onClick={() => setReportTarget(r.title)}
                  className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 transition-colors opacity-0 group-hover:opacity-100 mt-1"
                >
                  索取 <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── Modals ── */}
      <DarkModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        title="申请入会"
        description="填写以下信息，协会秘书处将尽快联系您"
        accentColor="#7c3aed"
        accentIcon={<Users className="h-4 w-4 text-violet-600" />}
      >
        <JoinForm onClose={() => setJoinOpen(false)} />
      </DarkModal>

      <DarkModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        title="索取完整报告"
        description="填写联系方式，我们将发送至您邮箱"
        accentColor="#6366f1"
        accentIcon={<BookOpen className="h-4 w-4 text-indigo-600" />}
      >
        {reportTarget && <ReportForm title={reportTarget} onClose={() => setReportTarget(null)} />}
      </DarkModal>

    </div>
  )
}

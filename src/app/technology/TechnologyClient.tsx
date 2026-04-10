'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import {
  Cpu, FlaskConical, Microscope, Zap, ArrowRight,
  BadgeCheck, Clock, ChevronRight, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { applyTechProject, type ActionState } from '@/app/services/actions'
import {
  DarkModal, DarkField, DarkSelect, DarkTextarea,
  DarkSubmitButton, FormFeedback,
} from '@/components/ui/DarkModal'

// ── Data ──────────────────────────────────────────────────────────────────────

const TECH_FIELDS = [
  { key: 'mechanical',  label: '机械回收', color: '#60a5fa', icon: Cpu },
  { key: 'chemical',    label: '化学回收', color: '#34d399', icon: FlaskConical },
  { key: 'enzymatic',   label: '酶解技术', color: '#a78bfa', icon: Microscope },
  { key: 'sorting',     label: '智能分选', color: '#fbbf24', icon: Zap },
]

const PROJECTS = [
  {
    id: 'p1', field: 'chemical',
    title: '混合废塑料低温催化裂解单体化',
    lab: '中科院化学所', status: 'active', progress: 72,
    desc: '开发铑基双功能催化剂，在65°C水相体系下同时断裂PE/PP的C-C键，目标产物纯度≥98%，正在进行千克级放大实验。',
    tags: ['PE', 'PP', '催化剂', '化学回收'],
    maturity: 'TRL 5',
    updated: '2026-04',
  },
  {
    id: 'p2', field: 'enzymatic',
    title: 'PET酶解解聚工艺工业化放大',
    lab: '清华大学化工系', status: 'active', progress: 88,
    desc: '基于工程化FAST-PETase突变体，攻克工业规模下酶活稳定性与底物预处理两大瓶颈，单线年处理2万吨，成本低于化学法23%。',
    tags: ['PET', '酶解', '工业化', '降本'],
    maturity: 'TRL 7',
    updated: '2026-04',
  },
  {
    id: 'p3', field: 'sorting',
    title: '多材质混合塑料高速近红外分选系统',
    lab: '中国科学技术大学', status: 'active', progress: 60,
    desc: '融合高光谱成像与深度学习识别算法，在12m/s传送带速度下实现PP/PE/PET/PS/PVC五类材质准确率99.2%，误分率降至0.3%以内。',
    tags: ['近红外', '深度学习', '分选装备'],
    maturity: 'TRL 4',
    updated: '2026-03',
  },
  {
    id: 'p4', field: 'mechanical',
    title: '食品级再生PP超洁净回收工艺',
    lab: '浙江大学材料学院', status: 'recruiting',
    progress: 30,
    desc: '开发适配食品接触级再生PP的超洁净洗涤-萃取-脱气组合工艺，目标通过EFSA风险评估，满足EU 2022/1616要求，现招募合作企业联合攻关。',
    tags: ['PP', '食品接触', 'EFSA', '合规'],
    maturity: 'TRL 3',
    updated: '2026-03',
  },
]

const STAGES = ['概念验证', '原型开发', '小试', '中试', '产业化']

// ── Application form ──────────────────────────────────────────────────────────

const IDLE: ActionState = { status: 'idle' }

function ApplyForm({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState(applyTechProject, IDLE)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DarkField label="联系人" name="name" required placeholder="您的姓名" />
        <DarkField label="单位名称" name="company" required placeholder="机构/企业" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DarkField label="邮箱" name="email" type="email" required placeholder="工作邮箱" />
        <DarkField label="手机" name="phone" placeholder="联系电话" hint="选填" />
      </div>
      <DarkField label="项目名称" name="projectName" required placeholder="请输入项目全称" />
      <div className="grid grid-cols-2 gap-3">
        <DarkSelect label="技术领域" name="techField" required>
          <option value="" style={{ background: '#0f172a' }}>请选择</option>
          {TECH_FIELDS.map(f => (
            <option key={f.key} value={f.key} style={{ background: '#0f172a' }}>{f.label}</option>
          ))}
        </DarkSelect>
        <DarkSelect label="研发阶段" name="stage" required>
          <option value="" style={{ background: '#0f172a' }}>请选择</option>
          {STAGES.map(s => (
            <option key={s} value={s} style={{ background: '#0f172a' }}>{s}</option>
          ))}
        </DarkSelect>
      </div>
      <DarkField label="预算需求" name="budget" placeholder="例：200万元以内" hint="选填" />
      <DarkTextarea label="项目描述" name="description" required rows={4}
        placeholder="请描述技术方案、现有进展、合作需求等核心信息（不少于10字）" />
      <FormFeedback state={state} />
      {state.status !== 'success' && <DarkSubmitButton label="提交项目申报" accentColor="#06b6d4" />}
      {state.status === 'success' && (
        <button type="button" onClick={onClose}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-slate-300 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
          关闭
        </button>
      )}
    </form>
  )
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ p, onApply }: { p: typeof PROJECTS[0]; onApply: () => void }) {
  const field = TECH_FIELDS.find(f => f.key === p.field)
  const FieldIcon = field?.icon ?? Cpu
  const isRecruiting = p.status === 'recruiting'

  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.30)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${field?.color ?? '#fff'}35`
        e.currentTarget.style.boxShadow = `0 0 28px ${field?.color ?? '#fff'}10, 0 12px 36px rgba(0,0,0,0.45)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.30)'
      }}
    >
      {/* Recruiting glow */}
      {isRecruiting && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 60%)` }} />
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${field?.color ?? '#fff'}18`, boxShadow: `0 2px 10px ${field?.color ?? '#fff'}20` }}>
          <FieldIcon className="h-5 w-5" style={{ color: field?.color ?? '#fff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {field && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ background: `${field.color}18`, color: field.color }}>{field.label}</span>
            )}
            {isRecruiting ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.30)' }}>
                ● 招募合作
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.22)' }}>
                进行中
              </span>
            )}
            <span className="text-[10px] text-slate-600 ml-auto">{p.maturity}</span>
          </div>
          <h3 className="text-[14px] font-bold text-white/90 leading-snug">{p.title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{p.lab} · 更新 {p.updated}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12.5px] text-slate-400 leading-relaxed line-clamp-3">{p.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {p.tags.map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{t}</span>
        ))}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-slate-500">研发进度</span>
          <span style={{ color: field?.color ?? '#fff' }}>{p.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: field?.color ?? '#fff', opacity: 0.8 }} />
        </div>
      </div>

      {/* CTA */}
      {isRecruiting && (
        <button onClick={onApply}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 hover:opacity-90"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.28)' }}>
          <ChevronRight className="h-3.5 w-3.5" /> 申请联合攻关
        </button>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TechnologyClient() {
  const [applyOpen, setApplyOpen] = useState(false)
  const [fieldFilter, setFieldFilter] = useState('全部')

  const filtered = fieldFilter === '全部' ? PROJECTS : PROJECTS.filter(p => p.field === fieldFilter)

  return (
    <div style={{ background: 'linear-gradient(180deg, #020a14 0%, #07111f 55%, #f8fafc 100%)' }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-10 pb-16">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>攻坚支撑</span><span>/</span>
            <span className="text-cyan-400 font-medium">技术攻关</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-cyan-500/25 bg-cyan-500/8 text-cyan-400 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            关键空白 · 前沿突破
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">技术攻关</h1>
          <p className="text-slate-400 text-base max-w-xl leading-relaxed mb-8">
            聚焦机械回收、化学回收、酶解技术、智能分选四大关键领域，加速前沿技术从实验室到产业线
          </p>

          <button onClick={() => setApplyOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', boxShadow: '0 4px 20px rgba(6,182,212,0.35)' }}>
            <FileText className="h-4 w-4" /> 提交项目申报
          </button>

          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: Microscope, label: '在研项目', value: `${PROJECTS.length}` },
              { icon: BadgeCheck, label: '合作高校/研究院', value: '12' },
              { icon: Clock,      label: '平均TRL', value: '5.2' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-cyan-400 opacity-70" />
                <div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-[12px] text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">

        {/* Tech field overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {TECH_FIELDS.map(({ key, label, color, icon: Icon }) => {
            const count = PROJECTS.filter(p => p.field === key).length
            return (
              <button key={key} onClick={() => setFieldFilter(fieldFilter === key ? '全部' : key)}
                className={cn(
                  'p-4 rounded-2xl flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5',
                  fieldFilter === key ? 'ring-1' : '',
                )}
                style={{
                  background: fieldFilter === key ? `${color}15` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${fieldFilter === key ? color + '40' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18` }}>
                  <Icon className="h-4.5 w-4.5" style={{ color }} />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-white/90">{label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{count} 个项目</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Project grid */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-white">
            {fieldFilter === '全部' ? '全部项目' : TECH_FIELDS.find(f => f.key === fieldFilter)?.label}
            <span className="text-slate-600 font-normal text-[13px] ml-2">({filtered.length})</span>
          </h2>
          {fieldFilter !== '全部' && (
            <button onClick={() => setFieldFilter('全部')} className="text-[12px] text-slate-500 hover:text-slate-300 transition-colors">
              清除筛选
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(p => <ProjectCard key={p.id} p={p} onApply={() => setApplyOpen(true)} />)}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 rounded-2xl text-center"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(99,102,241,0.06) 100%)', border: '1px solid rgba(6,182,212,0.20)' }}>
          <Cpu className="h-10 w-10 mx-auto mb-4 text-cyan-400 opacity-80" />
          <h3 className="text-[18px] font-bold text-white mb-2">有项目想联合攻关？</h3>
          <p className="text-[13px] text-slate-400 max-w-md mx-auto mb-5">
            我们为具有产业转化潜力的技术项目提供资金对接、场地支持与市场资源，一键提交即可进入初评通道
          </p>
          <button onClick={() => setApplyOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', boxShadow: '0 4px 20px rgba(6,182,212,0.30)' }}>
            <FileText className="h-4 w-4" /> 立即申报 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DarkModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="项目申报"
        description="技术委员会将在5个工作日内完成初步评审"
        accentColor="#06b6d4"
        accentIcon={<Cpu className="h-4 w-4" style={{ color: '#67e8f9' }} />}
      >
        <ApplyForm onClose={() => setApplyOpen(false)} />
      </DarkModal>

    </div>
  )
}

'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import {
  Cpu, FlaskConical, Microscope, Zap, ArrowRight,
  BadgeCheck, Clock, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { applyTechProject, type ActionState } from '@/app/services/actions'
import {
  DarkModal, DarkField, DarkSelect, DarkTextarea,
  DarkSubmitButton, FormFeedback,
} from '@/components/ui/DarkModal'

// ── Data ──────────────────────────────────────────────────────────────────────

const TECH_FIELDS = [
  { key: 'mechanical',  label: '机械回收', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: Cpu },
  { key: 'chemical',    label: '化学回收', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: FlaskConical },
  { key: 'enzymatic',   label: '酶解技术', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Microscope },
  { key: 'sorting',     label: '智能分选', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Zap },
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
          <option value="">请选择</option>
          {TECH_FIELDS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </DarkSelect>
        <DarkSelect label="研发阶段" name="stage" required>
          <option value="">请选择</option>
          {STAGES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </DarkSelect>
      </div>
      <DarkField label="预算需求" name="budget" placeholder="例：200万元以内" hint="选填" />
      <DarkTextarea label="项目描述" name="description" required rows={4}
        placeholder="请描述技术方案、现有进展、合作需求等核心信息（不少于10字）" />
      <FormFeedback state={state} />
      {state.status !== 'success' && <DarkSubmitButton label="提交项目申报" accentColor="#0891b2" />}
      {state.status === 'success' && (
        <button type="button" onClick={onClose}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 border border-slate-200">
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
    <div className="group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-200 shadow-sm hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] hover:border-slate-300">
      {/* Top color accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-t-2xl"
        style={{ background: field?.color ?? '#e2e8f0' }} />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{ background: field?.bg ?? '#f8fafc', borderColor: field?.border ?? '#e2e8f0' }}>
          <FieldIcon className="h-5 w-5" style={{ color: field?.color ?? '#475569' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {field && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                style={{ background: field.bg, color: field.color, borderColor: field.border }}>{field.label}</span>
            )}
            {isRecruiting ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse bg-amber-50 border border-amber-200 text-amber-700">
                ● 招募合作
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                进行中
              </span>
            )}
            <span className="text-[10px] text-slate-400 ml-auto">{p.maturity}</span>
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">{p.title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{p.lab} · 更新 {p.updated}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-3">{p.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {p.tags.map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">{t}</span>
        ))}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-slate-400">研发进度</span>
          <span style={{ color: field?.color ?? '#475569' }}>{p.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: field?.color ?? '#94a3b8' }} />
        </div>
      </div>

      {/* CTA */}
      {isRecruiting && (
        <button onClick={onApply}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 hover:brightness-95 bg-amber-50 border border-amber-200 text-amber-700">
          申请联合攻关 <ArrowRight className="h-3.5 w-3.5" />
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
    <div className="bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-10 pb-16 bg-gradient-to-br from-white via-cyan-50/30 to-teal-50/20">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 65%)', filter: 'blur(70px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>攻坚支撑</span><span>/</span>
            <span className="text-cyan-600 font-medium">技术攻关</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            关键空白 · 前沿突破
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">技术攻关</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed mb-8">
            聚焦机械回收、化学回收、酶解技术、智能分选四大关键领域，加速前沿技术从实验室到产业线
          </p>

          <button onClick={() => setApplyOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', boxShadow: '0 4px 20px rgba(6,182,212,0.20)' }}>
            <FileText className="h-4 w-4" /> 提交项目申报
          </button>

          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: Microscope, label: '在研项目', value: `${PROJECTS.length}` },
              { icon: BadgeCheck, label: '合作高校/研究院', value: '12' },
              { icon: Clock,      label: '平均TRL', value: '5.2' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-cyan-600" />
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">

        {/* Tech field overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {TECH_FIELDS.map(({ key, label, color, bg, border, icon: Icon }) => {
            const count = PROJECTS.filter(p => p.field === key).length
            const isActive = fieldFilter === key
            return (
              <button key={key} onClick={() => setFieldFilter(isActive ? '全部' : key)}
                className={cn(
                  'p-4 rounded-2xl flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 border text-left',
                  isActive ? 'shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm',
                )}
                style={isActive ? { background: bg, borderColor: border } : undefined}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{ background: isActive ? 'white' : bg, borderColor: border }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-slate-900">{label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{count} 个项目</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Project grid */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-bold text-slate-900">
            {fieldFilter === '全部' ? '全部项目' : TECH_FIELDS.find(f => f.key === fieldFilter)?.label}
            <span className="text-slate-400 font-normal text-[13px] ml-2">({filtered.length})</span>
          </h2>
          {fieldFilter !== '全部' && (
            <button onClick={() => setFieldFilter('全部')} className="text-[12px] text-slate-400 hover:text-slate-700 transition-colors">
              清除筛选
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(p => <ProjectCard key={p.id} p={p} onApply={() => setApplyOpen(true)} />)}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 rounded-2xl text-center bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100">
          <div className="w-12 h-12 rounded-2xl bg-white border border-cyan-100 shadow-sm flex items-center justify-center mx-auto mb-4">
            <Cpu className="h-6 w-6 text-cyan-600" />
          </div>
          <h3 className="text-[18px] font-bold text-slate-900 mb-2">有项目想联合攻关？</h3>
          <p className="text-[13px] text-slate-500 max-w-md mx-auto mb-5">
            我们为具有产业转化潜力的技术项目提供资金对接、场地支持与市场资源，一键提交即可进入初评通道
          </p>
          <button onClick={() => setApplyOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', boxShadow: '0 4px 20px rgba(6,182,212,0.20)' }}>
            <FileText className="h-4 w-4" /> 立即申报 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DarkModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="项目申报"
        description="技术委员会将在5个工作日内完成初步评审"
        accentColor="#0891b2"
        accentIcon={<Cpu className="h-4 w-4 text-cyan-600" />}
      >
        <ApplyForm onClose={() => setApplyOpen(false)} />
      </DarkModal>

    </div>
  )
}

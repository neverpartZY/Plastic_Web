'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import {
  TrendingUp, DollarSign, BarChart2, Target,
  CheckCircle2, ArrowRight, Rocket,
  Leaf, Cpu, Package,
} from 'lucide-react'
import { applyFunding, type ActionState } from '@/app/services/actions'
import {
  DarkModal, DarkField, DarkSelect, DarkTextarea,
  DarkSubmitButton, FormFeedback,
} from '@/components/ui/DarkModal'

// ── Data ──────────────────────────────────────────────────────────────────────

const FUND_STAGES = ['天使轮', 'Pre-A轮', 'A轮', 'B轮', '战略融资', '产业并购']

const INDUSTRIES = [
  { key: 'chemical',   label: '化学回收', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: Cpu },
  { key: 'mechanical', label: '机械回收', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: Package },
  { key: 'sorting',    label: '智能分选', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: BarChart2 },
  { key: 'esg',        label: 'ESG服务', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', icon: Leaf },
]

const PORTFOLIO = [
  {
    name: '太空聚合工艺',
    round: 'B轮',
    amount: '1.8亿元',
    field: 'chemical',
    desc: '酶解PET技术领跑者，单线年处理2万吨',
    stage: '成长期',
    irr: '预计28%',
  },
  {
    name: '绿循新材料集团',
    round: 'A轮',
    amount: '6000万元',
    field: 'chemical',
    desc: '汽车工程塑料闭环回收，回收率94.2%',
    stage: '扩张期',
    irr: '预计22%',
  },
  {
    name: '蓝星智能分选',
    round: 'Pre-A轮',
    amount: '2000万元',
    field: 'sorting',
    desc: '高光谱AI分选系统，准确率99.2%',
    stage: '早期',
    irr: '预计35%',
  },
  {
    name: '碳溯科技',
    round: '天使轮',
    amount: '800万元',
    field: 'esg',
    desc: '再生塑料碳足迹溯源与认证SaaS平台',
    stage: '种子期',
    irr: '预计40%+',
  },
]

const CRITERIA = [
  { icon: Target, title: '技术壁垒', desc: '拥有核心专利或独特工艺，难以被低成本复制' },
  { icon: BarChart2, title: '市场规模', desc: '目标市场TAM≥50亿元，具备可验证的增长路径' },
  { icon: CheckCircle2, title: '团队背景', desc: '核心团队具备行业经验或顶尖院校背景' },
  { icon: Leaf, title: 'ESG属性', desc: '业务具有明确的碳减排或循环经济量化价值' },
]

// ── Application form ──────────────────────────────────────────────────────────

const IDLE: ActionState = { status: 'idle' }

function FundApplyForm({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState(applyFunding, IDLE)

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DarkField label="联系人" name="name" required placeholder="您的姓名" />
        <DarkField label="公司/项目名称" name="company" required placeholder="企业全称" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DarkField label="邮箱" name="email" type="email" required placeholder="工作邮箱" />
        <DarkField label="手机" name="phone" placeholder="联系电话" hint="选填" />
      </div>
      <DarkField label="项目名称" name="projectName" required placeholder="融资项目或公司名称" />
      <div className="grid grid-cols-2 gap-3">
        <DarkSelect label="融资阶段" name="fundingStage" required>
          <option value="">请选择</option>
          {FUND_STAGES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </DarkSelect>
        <DarkSelect label="所属赛道" name="industry">
          <option value="">请选择（选填）</option>
          {INDUSTRIES.map(i => (
            <option key={i.key} value={i.key}>{i.label}</option>
          ))}
        </DarkSelect>
      </div>
      <DarkField label="融资金额" name="fundingAmount" placeholder="例：3000万元" hint="选填" />
      <DarkTextarea label="项目简介" name="description" required rows={4}
        placeholder="请介绍核心技术/商业模式、当前进展、资金用途（不少于10字）" />
      <FormFeedback state={state} />
      {state.status !== 'success' && <DarkSubmitButton label="提交融资申请" accentColor="#e11d48" />}
      {state.status === 'success' && (
        <button type="button" onClick={onClose}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 border border-slate-200">
          关闭
        </button>
      )}
    </form>
  )
}

// ── Portfolio card ────────────────────────────────────────────────────────────

function PortfolioCard({ item }: { item: typeof PORTFOLIO[0] }) {
  const ind = INDUSTRIES.find(i => i.key === item.field)
  const IndIcon = ind?.icon ?? TrendingUp
  const stageColors: Record<string, { bg: string; text: string; border: string }> = {
    '种子期': { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    '早期':   { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    '成长期': { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    '扩张期': { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  }
  const stageStyle = stageColors[item.stage] ?? { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' }

  return (
    <div className="p-6 rounded-3xl flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border"
            style={{ background: ind?.bg ?? '#f8fafc', borderColor: ind?.border ?? '#e2e8f0' }}>
            <IndIcon className="h-4.5 w-4.5" style={{ color: ind?.color ?? '#475569' }} />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-slate-900">{item.name}</h4>
            <p className="text-[11px] text-slate-500">{item.desc}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md font-semibold border"
            style={{ background: stageStyle.bg, color: stageStyle.text, borderColor: stageStyle.border }}>{item.round}</span>
          <span className="text-slate-500">{item.amount}</span>
        </div>
        <div className="text-emerald-600 font-semibold">{item.irr}</div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FundClient() {
  const [applyOpen, setApplyOpen] = useState(false)

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-24 pb-20 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/20">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-5 text-[13px] text-slate-500">
            <span>攻坚支撑</span><span>/</span>
            <span className="text-rose-600 font-medium">产业基金</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            投资赋能 · 产业加速
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">产业基金</h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed mb-8">
            聚焦塑料循环产业链关键节点，为具备技术壁垒与规模化潜力的优质项目提供全周期投资赋能
          </p>

          <button onClick={() => setApplyOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)', boxShadow: '0 4px 20px rgba(244,63,94,0.25)' }}>
            <Rocket className="h-4 w-4" /> 申请融资对接
          </button>

          {/* Fund overview */}
          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { icon: DollarSign, label: '管理规模', value: '5亿+' },
              { icon: Target,     label: '已投项目', value: `${PORTFOLIO.length}` },
              { icon: TrendingUp, label: '平均IRR', value: '31%' },
              { icon: Leaf,       label: '碳减排量', value: '12万吨/年' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 ring-4 ring-rose-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-rose-500" />
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

        {/* ── Investment focus ── */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-5">重点赛道</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INDUSTRIES.map(({ key, label, color, bg, border, icon: Icon }) => (
              <div key={key} className="p-6 rounded-3xl text-center transition-all duration-200 hover:-translate-y-1 border shadow-xl shadow-slate-100"
                style={{ background: bg, borderColor: border }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-white border"
                  style={{ borderColor: border, boxShadow: `0 4px 14px ${color}15` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div className="text-[14px] font-bold text-slate-900">{label}</div>
                <div className="text-[11px] text-slate-500 mt-1">重点布局</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">投资组合</h2>
            <span className="text-[12px] text-slate-400">{PORTFOLIO.length} 个项目</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PORTFOLIO.map(item => <PortfolioCard key={item.name} item={item} />)}
          </div>
        </section>

        {/* ── Investment criteria ── */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-5">投资标准</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CRITERIA.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-rose-100">
                  <Icon className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-slate-900 mb-1">{title}</h4>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section>
          <div className="p-8 md:p-12 rounded-3xl relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 shadow-xl shadow-slate-100">
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 65%)', filter: 'blur(50px)' }} />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white border border-rose-100 shadow-sm">
                  <Rocket className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-slate-900 mb-1.5">准备好接受投资了吗？</h3>
                  <p className="text-[13px] text-slate-500 max-w-lg">
                    提交融资申请后，基金投资团队将在7个工作日内完成项目评估并与您取得联系，
                    符合条件的项目将进入正式尽调流程
                  </p>
                </div>
              </div>
              <button onClick={() => setApplyOpen(true)}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-105"
                style={{ background: 'linear-gradient(135deg, #e11d48, #f43f5e)', boxShadow: '0 4px 20px rgba(244,63,94,0.25)' }}>
                立即申请 <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

      </div>

      <DarkModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="融资申请"
        description="基金团队将在7个工作日内完成初步评估"
        accentColor="#e11d48"
        accentIcon={<TrendingUp className="h-4 w-4 text-rose-600" />}
      >
        <FundApplyForm onClose={() => setApplyOpen(false)} />
      </DarkModal>

    </div>
  )
}

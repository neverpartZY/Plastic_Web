'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Bell, X, Check, Mail, Building2, User, ChevronDown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KEYWORD_MATRIX, type Dimension } from '@/lib/intelligence/keywords'

// ── Types ─────────────────────────────────────────────────────────────────────

type Lang = 'zh' | 'en'

// ── Country codes ─────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { value: '+86', label: '🇨🇳 +86' },
  { value: '+1',  label: '🇺🇸 +1'  },
  { value: '+44', label: '🇬🇧 +44' },
  { value: '+49', label: '🇩🇪 +49' },
  { value: '+33', label: '🇫🇷 +33' },
  { value: '+81', label: '🇯🇵 +81' },
  { value: '+82', label: '🇰🇷 +82' },
  { value: '+65', label: '🇸🇬 +65' },
  { value: '+60', label: '🇲🇾 +60' },
  { value: '+61', label: '🇦🇺 +61' },
  { value: '+852', label: '🇭🇰 +852' },
  { value: '+886', label: '🇹🇼 +886' },
]

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-full',
        'bg-emerald-600 text-white text-[13px] font-semibold shadow-xl',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      )}
    >
      <Check className="h-4 w-4 text-emerald-200 flex-shrink-0" />
      {message}
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────────

interface NavbarSubscribeModalProps {
  open: boolean
  onClose: () => void
}

export default function NavbarSubscribeModal({ open, onClose }: NavbarSubscribeModalProps) {
  // ── 联系信息 ──────────────────────────────────────────────────────────────
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle]   = useState('')
  const [phone, setPhone]         = useState('')
  const [countryCode, setCountryCode] = useState('+86')
  const [password, setPassword]   = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ── 情报偏好 ──────────────────────────────────────────────────────────────
  const [selectedDimensions, setSelectedDimensions] = useState<Set<Dimension>>(new Set<Dimension>(['recycling']))
  const [lang, setLang] = useState<Lang>('zh')

  // ── UI 状态 ───────────────────────────────────────────────────────────────
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState('')

  if (!open) return null

  // ── 一键填充（模拟从 Session 读取已登录用户信息）────────────────────────
  async function handleAutoFill() {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        if (data.email) setEmail(data.email)
        if (data.companyName) setCompanyName(data.companyName)
        if (data.jobTitle) setJobTitle(data.jobTitle)
        setToast('已填充您的联系信息')
      } else {
        setToast('暂无可填充的信息，请手动填写')
      }
    } catch {
      setToast('自动填充失败，请手动填写')
    }
    setTimeout(() => setToast(''), 3000)
  }

  function toggleDimension(dim: Dimension) {
    setSelectedDimensions(prev => {
      const next = new Set(prev)
      next.has(dim) ? next.delete(dim) : next.add(dim)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const emailTrim = email.trim()
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setToast('请输入有效的公司邮箱')
      setTimeout(() => setToast(''), 3000)
      return
    }
    if (selectedDimensions.size === 0) {
      setToast('请至少选择一个维度')
      setTimeout(() => setToast(''), 3000)
      return
    }
    if (!name.trim() || name.trim().length < 2) {
      setToast('请输入您的姓名（至少2个字符）')
      setTimeout(() => setToast(''), 3000)
      return
    }
    if (!password || password.length < 8) {
      setToast('密码至少8个字符')
      setTimeout(() => setToast(''), 3000)
      return
    }
    if (password !== confirmPassword) {
      setToast('两次密码不一致')
      setTimeout(() => setToast(''), 3000)
      return
    }

    setLoading(true)
    try {
      // Step 1: Register account
      const registerRes = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          identifier: emailTrim,
          password,
          confirmPassword,
        }),
      })
      const registerData = await registerRes.json()
      if (!registerRes.ok) {
        const errMsg = registerData?.error?.formErrors?.[0] ?? '注册失败，请重试'
        setToast(errMsg)
        setTimeout(() => setToast(''), 3000)
        setLoading(false)
        return
      }

      // Step 2: Subscribe
      const subscribeRes = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrim,
          phone:        phone ? `${countryCode} ${phone}` : undefined,
          channel:      'email',
          interests:    Array.from(selectedDimensions),
          lang,
          companyName:  companyName || undefined,
          jobTitle:     jobTitle || undefined,
          sourcePage:   'navbar-subscribe-modal',
        }),
      })
      const subscribeData = await subscribeRes.json()
      if (!subscribeData.success) {
        setToast(subscribeData.error ?? '订阅失败，请重试')
        setTimeout(() => setToast(''), 3000)
        setLoading(false)
        return
      }

      // Step 3: Sign in
      await signIn('credentials', {
        identifier: emailTrim,
        password,
        redirect: false,
      })

      setToast('注册并订阅成功！欢迎加入平台')
      setTimeout(() => { setToast(''); onClose() }, 2500)
    } catch {
      setToast('网络错误，请检查网络后重试')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toast message={toast} visible={!!toast} />

      <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col pointer-events-auto"
          style={{ boxShadow: '0 40px 100px -12px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 leading-none">
                  开启智能化情报服务
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  覆盖7大战略维度 · 精准匹配您所需的信息源
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-0 flex flex-col gap-5">

            {/* ══ 联系信息 ══ */}
            <div className="space-y-3">

              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">联系信息</p>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="text-[11px] text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                >
                  一键填充 →
                </button>
              </div>

              {/* 姓名 + 手机号并排 */}
              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    姓名 <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="您的姓名"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px]
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                        placeholder:text-gray-300 transition-all"
                    />
                  </div>
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    手机号 <span className="text-gray-400 font-normal">(选填)</span>
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      className="appearance-none px-2 py-2.5 rounded-xl border border-gray-200 text-[12px]
                        text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                        focus:border-emerald-400 transition-all cursor-pointer flex-shrink-0"
                    >
                      {COUNTRY_CODES.map(cc => (
                        <option key={cc.value} value={cc.value}>{cc.value}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="138 0000 0000"
                      className="flex-1 px-2.5 py-2.5 rounded-xl border border-gray-200 text-[13px]
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                        placeholder:text-gray-300 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 公司名称 & 职位（并排） */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    <Building2 className="inline h-3 w-3 mr-0.5" />
                    公司名称
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="公司/机构名称"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px]
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                      placeholder:text-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    <User className="inline h-3 w-3 mr-0.5" />
                    职位
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="采购/研发/战略"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px]
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                      placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  公司邮箱 <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px]
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                      placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>

              {/* 密码 + 确认密码并排 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    密码 <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="至少8字符"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px]
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                        placeholder:text-gray-300 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    确认密码 <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 pointer-events-none" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="再次输入"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-[13px]
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                        placeholder:text-gray-300 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ══ 情报偏好 ══ */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                情报偏好 <span className="text-emerald-500 font-normal">(可多选)</span>
              </p>

              {/* 维度选择 - compact chips */}
              <div className="flex flex-wrap gap-1.5">
                {KEYWORD_MATRIX.map(({ dimension, labelZh }) => {
                  const checked = selectedDimensions.has(dimension as Dimension)
                  return (
                    <button
                      key={dimension}
                      type="button"
                      onClick={() => toggleDimension(dimension as Dimension)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-left',
                        'text-[11px] font-medium transition-all duration-150',
                        checked
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      <span className={cn(
                        'flex-shrink-0 h-3 w-3 rounded border flex items-center justify-center transition-colors',
                        checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'
                      )}>
                        {checked && <Check className="h-2 w-2 text-white" />}
                      </span>
                      {labelZh}
                    </button>
                  )
                })}
              </div>

              {/* 偏好语言 */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">偏好语言</p>
                <div className="flex gap-1">
                  {([
                    { value: 'zh', label: '中文' },
                    { value: 'en', label: 'EN' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLang(value)}
                      className={cn(
                        'flex-1 py-2 rounded-xl border text-center text-[12px] font-medium transition-all duration-150',
                        lang === value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Sticky CTA footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white rounded-b-3xl">
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[13px] font-bold
                hover:bg-emerald-500 active:bg-emerald-700 transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? '订阅中…' : '开启智能化情报服务'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

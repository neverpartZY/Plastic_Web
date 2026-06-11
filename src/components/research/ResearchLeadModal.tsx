'use client'

import { useState } from 'react'
import { FileText, X, Check, Mail, Building2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResearchLeadModalProps {
  isOpen: boolean
  onClose: () => void
  reportTitle: string
}

export default function ResearchLeadModal({ isOpen, onClose, reportTitle }: ResearchLeadModalProps) {
  const [email, setEmail]           = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

    setLoading(true)
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          channel: 'email',
          interests: ['recycling', 'recycled', 'bio', 'molding'],
          frequency: 'weekly',
          companyName: companyName || undefined,
          jobTitle:    jobTitle    || undefined,
          sourcePage:  'research-report-gate',
        }),
      })
      setSuccess(true)
      setTimeout(() => { onClose(); setSuccess(false) }, 2500)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
        style={{ boxShadow: '0 40px 100px -12px rgba(0,0,0,0.22)' }}
      >
        {success ? (
          <div className="flex flex-col items-center py-12 px-8">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">提交成功</h3>
            <p className="text-[13px] text-gray-500 text-center">我们的分析师将在 4 小时内联系您<br/>请留意邮箱：{email}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-7 pt-7 pb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900 leading-none">获取完整报告</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{reportTitle}</p>
                </div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-7 pb-7 flex flex-col gap-5">
              <p className="text-[12.5px] text-gray-500 leading-relaxed">
                填写您的联系信息，我们的分析师将在 <strong>4 小时内</strong>与您取得联系，协助您获取完整版报告。
              </p>

              {/* 邮箱 */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  公司邮箱 <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 text-[13.5px]
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                      placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>

              {/* 公司名称 & 职位（并排） */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <Building2 className="inline h-3 w-3 mr-0.5" />公司名称
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="公司/机构名称"
                    className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-[13px]
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                      placeholder:text-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <User className="inline h-3 w-3 mr-0.5" />职位
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="采购/研发/战略"
                    className="w-full px-3 py-2.5 rounded-2xl border border-gray-200 text-[13px]
                      focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400
                      placeholder:text-gray-300 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white text-[14px] font-bold
                  hover:bg-emerald-500 active:bg-emerald-700 transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? '提交中…' : '提交并获取报告'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

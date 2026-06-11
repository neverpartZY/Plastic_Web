'use client'

import { useState } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Dimension } from '@/lib/intelligence/keywords'

export type Frequency = 'realtime' | 'daily' | 'weekly'

interface SubscribeModalProps {
  open: boolean
  onClose: () => void
  /** Pre-selected dimension when triggered from a card tag */
  initialDimension?: Dimension
}

const DIMENSIONS: { value: Dimension; labelZh: string; labelEn: string; color: string }[] = [
  { value: 'molds',       labelZh: '模具',    labelEn: 'Molds',       color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'molding',     labelZh: '成型',    labelEn: 'Molding',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'recycled',    labelZh: '再生塑料', labelEn: 'Recycled',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'bio',         labelZh: '生物基',  labelEn: 'Bio-based',   color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'additives',   labelZh: '助剂',    labelEn: 'Additives',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'auxiliaries', labelZh: '辅料',    labelEn: 'Auxiliaries', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'recycling',   labelZh: '回收再生', labelEn: 'Recycling', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'reuse',       labelZh: '重复使用', labelEn: 'Reuse',     color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]

const FREQUENCIES: { value: Frequency; labelZh: string; labelEn: string; descZh: string }[] = [
  { value: 'realtime', labelZh: '实时', labelEn: 'Realtime', descZh: '有新情报时立即推送' },
  { value: 'daily',    labelZh: '每日', labelEn: 'Daily',    descZh: '每天汇总一次' },
  { value: 'weekly',   labelZh: '每周', labelEn: 'Weekly',   descZh: '每周汇总一次' },
]

export default function SubscribeModal({ open, onClose, initialDimension }: SubscribeModalProps) {
  const [selectedDimensions, setSelectedDimensions] = useState<Dimension[]>(
    initialDimension ? [initialDimension] : []
  )
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [email, setEmail] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [channel, setChannel] = useState<'email' | 'webhook'>('email')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  function toggleDimension(dim: Dimension) {
    setSelectedDimensions(prev =>
      prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedDimensions.length === 0) {
      setError('请至少选择一个维度')
      return
    }
    if (channel === 'email' && !email) {
      setError('请输入邮箱地址')
      return
    }
    if (channel === 'webhook' && !webhookUrl) {
      setError('请输入 Webhook 地址')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        channel,
        email: channel === 'email' ? email : undefined,
        webhookUrl: channel === 'webhook' ? webhookUrl : undefined,
        interests: selectedDimensions,
        frequency,
        sourcePage: 'intelligence-card-subscribe',
      }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => { onClose(); setSuccess(false) }, 1800)
      } else {
        setError(data.error ?? '订阅失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Bell className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-[16px] font-bold text-gray-900">订阅情报维度</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-10 px-6">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-[15px] font-semibold text-gray-900">订阅成功！</p>
            <p className="text-[13px] text-gray-500 mt-1">您将在第一时间收到相关情报推送</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-5">
            {/* Dimension selector */}
            <div>
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                选择感兴趣的维度
              </p>
              <div className="flex flex-wrap gap-2">
                {DIMENSIONS.map(({ value, labelZh, color }) => {
                  const active = selectedDimensions.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleDimension(value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                        color,
                        active ? 'ring-2 ring-emerald-500 ring-offset-1' : 'opacity-60 hover:opacity-100'
                      )}
                    >
                      {labelZh}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Channel toggle */}
            <div>
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                接收方式
              </p>
              <div className="flex rounded-xl border border-gray-200 p-1 gap-1">
                {(['email', 'webhook'] as const).map(ch => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                      channel === ch
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    {ch === 'email' ? '📧 邮件' : '🔗 Webhook'}
                  </button>
                ))}
              </div>
            </div>

            {/* Email or Webhook input */}
            {channel === 'email' ? (
              <div>
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  邮箱地址
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
              </div>
            ) : (
              <div>
                <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                  Webhook URL
                </p>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                />
              </div>
            )}

            {/* Frequency selector */}
            <div>
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                推送频率
              </p>
              <div className="grid grid-cols-3 gap-2">
                {FREQUENCIES.map(({ value, labelZh, descZh }) => {
                  const active = frequency === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFrequency(value)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-2.5 rounded-xl border text-center transition-all duration-150',
                        active
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      <span className="text-[13px] font-semibold">{labelZh}</span>
                      <span className="text-[10px] opacity-70">{descZh}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-rose-500 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-[14px] font-semibold hover:bg-emerald-500 active:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '订阅中…' : '确认订阅'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

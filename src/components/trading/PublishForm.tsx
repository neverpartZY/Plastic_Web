'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

const MATERIALS = ['PET', 'PP', 'HDPE', 'LDPE', 'ABS', 'PC', 'PS', 'PVC', 'PA6', '其他']
const FORMS = ['瓶砖', '瓶片', '破碎料', '粉碎料', '颗粒', '膜料', '其他']

interface Props {
  onPublished: () => void
}

export default function PublishForm({ onPublished }: Props) {
  const [type, setType] = useState<'supply' | 'demand'>('supply')
  const [form, setForm] = useState({
    material: '', form: '', quantity: '', price: '', location: '', specs: '', notes: '', phone: '', company: '', wasteOrRecycled: '废塑料' as string,
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.material || !form.phone || !form.location) return
    setSending(true)
    setResult(null)

    try {
      // Register/login user first
      const uRes = await fetch('/api/trading/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', phone: form.phone }),
      })
      const uData = await uRes.json()

      let userId = uData.user?.id
      if (!userId) {
        // Auto-register
        const rRes = await fetch('/api/trading/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            name: form.company || form.phone,
            role: '贸易商',
            phone: form.phone,
            location: form.location,
            company: form.company,
          }),
        })
        const rData = await rRes.json()
        if (!rData.success) throw new Error(rData.error)
        userId = rData.user.id
      }

      // Publish listing
      const lRes = await fetch('/api/trading/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          wasteOrRecycled: form.wasteOrRecycled,
          material: form.material,
          form: form.form,
          quantity: Number(form.quantity) || 0,
          price: form.price ? Number(form.price) : null,
          location: form.location,
          specs: form.specs,
          notes: form.notes,
        }),
      })
      const lData = await lRes.json()
      if (!lData.success) throw new Error(lData.error)

      setResult(`发布成功！已自动匹配 ${lData.matches?.length || 0} 条意向`)
      onPublished()
    } catch (err: any) {
      setResult(`错误: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
  const labelCls = "text-xs font-semibold text-gray-600 mb-1"

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      <h3 className="text-base font-bold text-gray-900">发布{type === 'supply' ? '供应' : '需求'}</h3>

      {/* Type toggle */}
      <div className="flex gap-2">
        {(['supply', 'demand'] as const).map(t => (
          <button key={t} type="button"
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              type === t ? (t === 'supply' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white')
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >{t === 'supply' ? '我要供货' : '我要求购'}</button>
        ))}
        <select value={form.wasteOrRecycled} onChange={e => set('wasteOrRecycled', e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm bg-white">
          <option value="废塑料">废塑料</option>
          <option value="再生料">再生料</option>
        </select>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className={labelCls}>手机号 *</div>
          <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="发布后用于查询匹配" required />
        </div>
        <div>
          <div className={labelCls}>企业名称</div>
          <input className={inputCls} value={form.company} onChange={e => set('company', e.target.value)}
            placeholder="可选填" />
        </div>
        <div>
          <div className={labelCls}>品类 *</div>
          <select className={inputCls} value={form.material} onChange={e => set('material', e.target.value)} required>
            <option value="">选择品类</option>
            {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <div className={labelCls}>形态</div>
          <select className={inputCls} value={form.form} onChange={e => set('form', e.target.value)}>
            <option value="">选择形态</option>
            {FORMS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <div className={labelCls}>数量（吨/月）</div>
          <input className={inputCls} type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)}
            placeholder="例: 30" />
        </div>
        <div>
          <div className={labelCls}>单价（元/吨）</div>
          <input className={inputCls} type="number" value={form.price} onChange={e => set('price', e.target.value)}
            placeholder="留空 = 价格面议" />
        </div>
        <div className="sm:col-span-2">
          <div className={labelCls}>所在地 *</div>
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="例: 广东佛山" required />
        </div>
        <div>
          <div className={labelCls}>规格说明</div>
          <input className={inputCls} value={form.specs} onChange={e => set('specs', e.target.value)}
            placeholder="例: 三色混合 含水率<3%" />
        </div>
        <div>
          <div className={labelCls}>备注</div>
          <input className={inputCls} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="例: 月供30吨，长期稳定" />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={sending}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          立即发布
        </button>
        {result && (
          <span className={`text-sm ${result.startsWith('发布成功') ? 'text-emerald-600' : 'text-rose-500'}`}>
            {result}
          </span>
        )}
      </div>
    </form>
  )
}

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { sendIndustryEmail } from '@/lib/mail'

export async function GET() {
  try {
    const simpleHtml = `<html><body style="font-family:sans-serif;background:#f9fafb;padding:40px">
      <div style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;max-width:600px;margin:0 auto;padding:32px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
          <img src="https://greenplastic.ai/logo.png" width="40" height="40" style="border-radius:10px">
          <div>
            <div style="color:#059669;font-size:18px;font-weight:700">绿塑科技</div>
            <div style="color:#94a3b8;font-size:11px">GreenPlastic Intelligence</div>
          </div>
        </div>
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin:0 0 8px">🟢 每日情报测试邮件</h1>
        <p style="color:#334155;font-size:15px;line-height:1.6">这是一封测试邮件，验证 Resend 邮件发送通道是否正常工作。</p>
        <p style="color:#334155;font-size:15px;line-height:1.6">如果收到此邮件，说明 <strong>AI 情报官</strong> 发件通道已成功配置！</p>
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0">
        <p style="color:#94a3b8;font-size:12px;text-align:center">由绿塑科技情报引擎发送 · © 2024 绿塑科技</p>
      </div>
    </body></html>`

    const result = await sendIndustryEmail({
      to: 'zhouyi@replas.org.cn',
      subject: '【测试】绿塑科技邮件通道验证',
      html: simpleHtml,
      lang: 'zh',
    })

    return NextResponse.json({ success: true, id: result.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

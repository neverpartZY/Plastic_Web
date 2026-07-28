import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendIndustryEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[mail] RESEND_API_KEY not set, skipping email to', to)
    return
  }
  return resend.emails.send({
    from: process.env.FROM_EMAIL || 'daily@greenplastic.ai',
    to,
    subject,
    html,
  })
}

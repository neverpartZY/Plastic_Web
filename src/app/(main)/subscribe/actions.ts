'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SubscribeSchema = z.object({
  contact: z
    .string()
    .min(1, '请填写联系方式')
    .refine(
      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^1[3-9]\d{9}$/.test(v),
      '请输入有效的邮箱或手机号',
    ),
  name: z.string().optional(),
  channel: z.enum(['email', 'wechat', 'feishu', 'whatsapp']).default('email'),
  interests: z.string().optional(),
})

export type SubscribeState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function subscribe(_: SubscribeState, formData: FormData): Promise<SubscribeState> {
  const raw = {
    contact: formData.get('contact') as string,
    name: (formData.get('name') as string) || undefined,
    channel: (formData.get('channel') as string) || 'email',
    interests: (formData.get('interests') as string) || undefined,
  }

  const parsed = SubscribeSchema.safeParse(raw)
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0].message }
  }

  const { contact, name, channel, interests } = parsed.data
  const isEmail = contact.includes('@')

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).subscriber.upsert({
      where: isEmail ? { email: contact } : { phone: contact },
      update: { name, channel, interests, isActive: true },
      create: {
        ...(isEmail ? { email: contact } : { phone: contact }),
        name,
        channel,
        interests,
      },
    })
    return { status: 'success', message: '订阅成功！我们将通过您选择的渠道发送每日情报' }
  } catch (e) {
    console.error('subscribe error', e)
    return { status: 'error', message: '订阅失败，请稍后重试' }
  }
}

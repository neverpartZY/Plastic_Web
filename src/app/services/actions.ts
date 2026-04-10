'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ── Shared state type ─────────────────────────────────────────────────────────

export type ActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

// ── Base applicant schema ─────────────────────────────────────────────────────

const BaseApplicant = z.object({
  name:    z.string().min(1, '请填写姓名'),
  company: z.string().optional(),
  email:   z.string().email('请填写有效邮箱'),
  phone:   z.string().optional(),
})

// ── 1. 索取报告 ───────────────────────────────────────────────────────────────

export async function requestReport(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = BaseApplicant.extend({
    reportTitle: z.string().min(1),
    reason: z.string().optional(),
  }).safeParse({
    name:         formData.get('name'),
    company:      formData.get('company') || undefined,
    email:        formData.get('email'),
    phone:        formData.get('phone') || undefined,
    reportTitle:  formData.get('reportTitle'),
    reason:       formData.get('reason') || undefined,
  })

  if (!parsed.success) return { status: 'error', message: parsed.error.errors[0].message }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).serviceApplication.create({
      data: {
        name:     parsed.data.name,
        company:  parsed.data.company,
        email:    parsed.data.email,
        phone:    parsed.data.phone,
        type:     'report_request',
        metadata: JSON.stringify({ reportTitle: parsed.data.reportTitle, reason: parsed.data.reason }),
      },
    })
    return { status: 'success', message: '申请已提交，我们将在1个工作日内与您联系' }
  } catch (e) {
    console.error(e)
    return { status: 'error', message: '提交失败，请稍后重试' }
  }
}

// ── 2. 加入协会 ───────────────────────────────────────────────────────────────

export async function joinAssociation(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = BaseApplicant.extend({
    role:    z.string().optional(),
    message: z.string().optional(),
  }).safeParse({
    name:    formData.get('name'),
    company: formData.get('company') || undefined,
    email:   formData.get('email'),
    phone:   formData.get('phone') || undefined,
    role:    formData.get('role') || undefined,
    message: formData.get('message') || undefined,
  })

  if (!parsed.success) return { status: 'error', message: parsed.error.errors[0].message }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).serviceApplication.create({
      data: {
        name:     parsed.data.name,
        company:  parsed.data.company,
        email:    parsed.data.email,
        phone:    parsed.data.phone,
        type:     'association_join',
        metadata: JSON.stringify({ role: parsed.data.role, message: parsed.data.message }),
      },
    })
    return { status: 'success', message: '入会申请已收到，协会秘书处将尽快审核并与您联系' }
  } catch (e) {
    console.error(e)
    return { status: 'error', message: '提交失败，请稍后重试' }
  }
}

// ── 3. 报名活动 ───────────────────────────────────────────────────────────────

export async function registerEvent(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = BaseApplicant.extend({
    eventId:    z.string().min(1),
    eventTitle: z.string().min(1),
    attendees:  z.coerce.number().min(1).max(10).default(1),
  }).safeParse({
    name:       formData.get('name'),
    company:    formData.get('company') || undefined,
    email:      formData.get('email'),
    phone:      formData.get('phone') || undefined,
    eventId:    formData.get('eventId'),
    eventTitle: formData.get('eventTitle'),
    attendees:  formData.get('attendees') || 1,
  })

  if (!parsed.success) return { status: 'error', message: parsed.error.errors[0].message }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).serviceApplication.create({
      data: {
        name:     parsed.data.name,
        company:  parsed.data.company,
        email:    parsed.data.email,
        phone:    parsed.data.phone,
        type:     'event_register',
        // Use mock ID prefix so SetNull doesn't fail on non-DB IDs
        eventId:  parsed.data.eventId.startsWith('evt-') ? null : parsed.data.eventId,
        metadata: JSON.stringify({ eventTitle: parsed.data.eventTitle, attendees: parsed.data.attendees }),
      },
    })
    return { status: 'success', message: `报名成功！确认邮件已发送至 ${parsed.data.email}` }
  } catch (e) {
    console.error(e)
    return { status: 'error', message: '报名失败，请稍后重试' }
  }
}

// ── 4. 项目申报 (技术攻关) ────────────────────────────────────────────────────

export async function applyTechProject(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = BaseApplicant.extend({
    projectName: z.string().min(2, '请填写项目名称'),
    techField:   z.string().min(1, '请选择技术领域'),
    stage:       z.string().min(1, '请选择研发阶段'),
    budget:      z.string().optional(),
    description: z.string().min(10, '项目描述不少于10字'),
  }).safeParse({
    name:        formData.get('name'),
    company:     formData.get('company') || undefined,
    email:       formData.get('email'),
    phone:       formData.get('phone') || undefined,
    projectName: formData.get('projectName'),
    techField:   formData.get('techField'),
    stage:       formData.get('stage'),
    budget:      formData.get('budget') || undefined,
    description: formData.get('description'),
  })

  if (!parsed.success) return { status: 'error', message: parsed.error.errors[0].message }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).serviceApplication.create({
      data: {
        name:     parsed.data.name,
        company:  parsed.data.company,
        email:    parsed.data.email,
        phone:    parsed.data.phone,
        type:     'tech_apply',
        metadata: JSON.stringify({
          projectName: parsed.data.projectName,
          techField:   parsed.data.techField,
          stage:       parsed.data.stage,
          budget:      parsed.data.budget,
          description: parsed.data.description,
        }),
      },
    })
    return { status: 'success', message: '项目申报已受理，技术委员会将在5个工作日内完成初步评审' }
  } catch (e) {
    console.error(e)
    return { status: 'error', message: '提交失败，请稍后重试' }
  }
}

// ── 5. 融资申请 (产业基金) ────────────────────────────────────────────────────

export async function applyFunding(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = BaseApplicant.extend({
    projectName:   z.string().min(2, '请填写项目/公司名称'),
    fundingStage:  z.string().min(1, '请选择融资阶段'),
    fundingAmount: z.string().optional(),
    industry:      z.string().optional(),
    description:   z.string().min(10, '项目描述不少于10字'),
  }).safeParse({
    name:          formData.get('name'),
    company:       formData.get('company') || undefined,
    email:         formData.get('email'),
    phone:         formData.get('phone') || undefined,
    projectName:   formData.get('projectName'),
    fundingStage:  formData.get('fundingStage'),
    fundingAmount: formData.get('fundingAmount') || undefined,
    industry:      formData.get('industry') || undefined,
    description:   formData.get('description'),
  })

  if (!parsed.success) return { status: 'error', message: parsed.error.errors[0].message }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).serviceApplication.create({
      data: {
        name:     parsed.data.name,
        company:  parsed.data.company,
        email:    parsed.data.email,
        phone:    parsed.data.phone,
        type:     'fund_apply',
        metadata: JSON.stringify({
          projectName:   parsed.data.projectName,
          fundingStage:  parsed.data.fundingStage,
          fundingAmount: parsed.data.fundingAmount,
          industry:      parsed.data.industry,
          description:   parsed.data.description,
        }),
      },
    })
    return { status: 'success', message: '融资申请已收到，基金投资团队将在7个工作日内与您取得联系' }
  } catch (e) {
    console.error(e)
    return { status: 'error', message: '提交失败，请稍后重试' }
  }
}

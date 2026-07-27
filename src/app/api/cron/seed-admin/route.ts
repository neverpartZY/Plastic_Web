/**
 * /api/cron/seed-admin
 *
 * One-shot cron: 创建管理员和测试用户账号
 * 由 Vercel Cron 在 8 月 1 日 00:07 (北京时间) 触发
 * 仅创建用户，不写入文章/标签等其他数据
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const adminHash = await bcrypt.hash('Admin@123456', 12)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@plastic.com' },
      update: { passwordHash: adminHash, role: 'admin', isActive: true },
      create: {
        email: 'admin@plastic.com',
        name: '管理员',
        passwordHash: adminHash,
        role: 'admin',
      },
    })

    const testHash = await bcrypt.hash('Test@123456', 12)
    const testUser = await prisma.user.upsert({
      where: { email: 'test@plastic.com' },
      update: { passwordHash: testHash, role: 'user', isActive: true },
      create: {
        email: 'test@plastic.com',
        name: '测试用户',
        passwordHash: testHash,
        role: 'user',
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Admin and test users seeded',
      admin: { id: admin.id, email: admin.email, role: admin.role },
      testUser: { id: testUser.id, email: testUser.email, role: testUser.role },
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

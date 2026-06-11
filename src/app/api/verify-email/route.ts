import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new NextResponse('Invalid token', { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  })

  if (!user) {
    return new NextResponse('Invalid or expired token', { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verificationToken: null },
  })

  return new NextResponse('邮箱验证成功！您现在可以正常登录使用平台。', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

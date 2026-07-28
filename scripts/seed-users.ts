const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  try {
    const hash = await bcrypt.hash('Admin@123456', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@plastic.com' },
      update: { passwordHash: hash, role: 'admin', isActive: true },
      create: { email: 'admin@plastic.com', name: '管理员', passwordHash: hash, role: 'admin' },
    })
    console.log('Admin created:', admin.id)

    const testHash = await bcrypt.hash('Test@123456', 12)
    const test = await prisma.user.upsert({
      where: { email: 'test@plastic.com' },
      update: { passwordHash: testHash, role: 'user', isActive: true },
      create: { email: 'test@plastic.com', name: '测试用户', passwordHash: testHash, role: 'user' },
    })
    console.log('Test created:', test.id)
    console.log('Done!')
  } finally {
    await prisma.$disconnect()
  }
}
main()

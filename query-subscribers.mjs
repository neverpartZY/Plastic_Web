import { prisma } from './src/lib/prisma.js'

const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
console.log('=== 订阅者 (Lead) ===')
leads.forEach(l => console.log(l.email, l.phone, l.companyName, l.interestedPillars, l.isActive, l.lang))

const subs = await prisma.subscription.findMany({ orderBy: { createdAt: 'desc' } })
console.log('\n=== 订阅 (Subscription) ===')
subs.forEach(s => console.log(s.email, s.channel, s.interests, s.frequency, s.isActive))

await prisma.$disconnect()
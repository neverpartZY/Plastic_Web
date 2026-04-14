import { prisma } from '@/lib/prisma'
import NewsForm from '@/components/admin/NewsForm'
import { mapPrismaTag, groupTagsByCategory } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '发布新文章' }

export default async function AdminNewsNewPage() {
  const tagsRaw = await prisma.tag.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })

  const tagsByCategory = groupTagsByCategory(tagsRaw.map(mapPrismaTag))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">发布新文章</h1>
      <NewsForm tagsByCategory={tagsByCategory} mode="create" />
    </div>
  )
}

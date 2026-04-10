import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// TODO: AI recommendation integration
// This endpoint is a stub for future AI-powered personalized recommendations.
// Integration points:
//   - User behavior tracking via data-track attributes on frontend
//   - Vector database for semantic similarity search
//   - LLM-based content ranking based on user reading history

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fallback: return latest news sorted by popularity
  const news = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 6,
    select: {
      id: true, title: true, summary: true, coverImage: true,
      source: true, viewCount: true, publishedAt: true,
      tags: { include: { tag: true } },
    },
  })

  return NextResponse.json({
    source: 'fallback', // 'ai' when AI integration is active
    items: news.map((item) => ({
      ...item,
      publishedAt: item.publishedAt.toISOString(),
      tags: item.tags.map((t) => t.tag),
    })),
  })
}

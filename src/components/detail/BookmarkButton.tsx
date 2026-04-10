'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  newsId: string
  initialBookmarked?: boolean
}

export default function BookmarkButton({ newsId, initialBookmarked = false }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!session) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      if (bookmarked) {
        await fetch(`/api/bookmarks/${newsId}`, { method: 'DELETE' })
        setBookmarked(false)
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newsId }),
        })
        setBookmarked(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={bookmarked ? 'default' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="gap-2"
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          已收藏
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          收藏
        </>
      )}
    </Button>
  )
}

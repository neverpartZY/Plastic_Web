'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminNewsActions({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('确认删除此文章？')) return
    await fetch(`/api/news/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
        <Link href={`/admin/news/${id}/edit`}>
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

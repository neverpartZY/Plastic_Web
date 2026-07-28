'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminIntelligenceActions({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('确认删除此条情报？')) return
    await fetch(`/api/intelligence/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <Link href={`/admin/intelligence/${id}/edit`} title="编辑">
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        title="删除"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

'use client'

import { Share2, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function ShareButtons() {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
      {copied ? (
        <>
          <Share2 className="h-4 w-4" />
          已复制链接
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4" />
          分享
        </>
      )}
    </Button>
  )
}

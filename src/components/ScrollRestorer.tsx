'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Saves scroll position to sessionStorage keyed by URL path+params.
 * On mount, restores the saved position if it exists (i.e. user pressed Back).
 */
export default function ScrollRestorer() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const key = `scroll:${pathname}?${searchParams.toString()}`
  const restoredRef = useRef(false)

  // Restore on mount
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    const saved = sessionStorage.getItem(key)
    if (saved) {
      const y = parseInt(saved, 10)
      // Small delay so the DOM is fully painted before scrolling
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: 'instant' })
      })
    }
  }, [key])

  // Save on every scroll
  useEffect(() => {
    const handler = () => {
      sessionStorage.setItem(key, String(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [key])

  return null
}

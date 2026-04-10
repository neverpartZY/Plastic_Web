'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Newspaper, Tag, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: '概览', icon: LayoutDashboard, exact: true },
  { href: '/admin/news', label: '新闻管理', icon: Newspaper },
  { href: '/admin/tags', label: '标签管理', icon: Tag },
  { href: '/admin/users', label: '用户管理', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-48 shrink-0">
      <div className="sticky top-24 rounded-xl border bg-card p-3 shadow-sm">
        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          后台管理
        </p>
        <nav className="space-y-0.5">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

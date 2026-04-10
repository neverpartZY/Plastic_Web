'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  isActive: boolean
  isPremium: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  async function load() {
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(data.items)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(user: User) {
    await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    setUsers((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <p className="text-sm text-muted-foreground">共 {total} 名用户</p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">用户</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">联系方式</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">角色</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">注册时间</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                      {user.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {!user.isActive && (
                        <p className="text-xs text-muted-foreground">已禁用</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                  {user.email ?? user.phone ?? '-'}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(user)}
                    className={`text-xs h-7 ${user.isActive ? 'text-destructive hover:bg-destructive hover:text-white' : 'text-green-600 hover:bg-green-600 hover:text-white'}`}
                  >
                    {user.isActive ? '禁用' : '启用'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

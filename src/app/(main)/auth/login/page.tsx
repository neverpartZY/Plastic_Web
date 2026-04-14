'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Recycle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, type LoginInput } from '@/lib/validations'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setError('')
    const result = await signIn('credentials', {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError('邮箱/手机号或密码错误，请重试')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="identifier">邮箱 / 手机号</Label>
        <Input
          id="identifier"
          placeholder="请输入邮箱或手机号"
          {...register('identifier')}
        />
        {errors.identifier && (
          <p className="text-xs text-destructive">{errors.identifier.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          placeholder="请输入密码"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />登录中...</>
        ) : '登录'}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Recycle className="h-7 w-7" />
            <span>塑料信息中心</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">登录账号</CardTitle>
            <CardDescription className="text-center">
              使用邮箱或手机号登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-center text-sm text-muted-foreground">加载中...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
            <p>
              还没有账号？{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                立即注册
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>测试账号：test@plastic.com / Test@123456</p>
          <p>管理员：admin@plastic.com / Admin@123456</p>
        </div>
      </div>
    </div>
  )
}

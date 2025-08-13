'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/userStore'
import { toast } from 'sonner'
import { Mail, User, CheckCircle } from 'lucide-react'

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, isRegistered, user } = useUserStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) {
      toast.error('请填写所有字段')
      return
    }

    if (!email.includes('@')) {
      toast.error('请输入有效的邮箱地址')
      return
    }

    setIsLoading(true)
    
    // 模拟注册延迟
    setTimeout(() => {
      register(email, name)
      toast.success('注册成功！欢迎加入Breezie！')
      setIsLoading(false)
      onSuccess?.()
    }, 1000)
  }

  if (isRegistered && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-green-600">注册成功！</CardTitle>
          <CardDescription>
            欢迎你，{user.name}！你已经成功注册Breezie。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>注册邮箱：{user.email}</p>
            <p>注册时间：{new Date(user.registeredAt).toLocaleDateString('zh-CN')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>加入Breezie</CardTitle>
        <CardDescription>
          注册获取App发布通知，成为首批用户
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="请输入你的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="请输入你的邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" 
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '立即注册'}
          </Button>
        </form>
        
        <p className="mt-4 text-xs text-center text-gray-500">
          注册即表示你同意接收Breezie的产品更新通知
        </p>
      </CardContent>
    </Card>
  )
}

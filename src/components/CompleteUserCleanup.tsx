'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Key,
  HardDrive
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'

interface CleanupResult {
  success: boolean
  message: string
  database_cleanup?: {
    cleaned_profile: boolean
    profile_found: boolean
  }
  auth_status?: {
    status: string
    message: string
    blocked: boolean
  }
  next_steps?: string
}

export function CompleteUserCleanup() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null)
  const { logout, user } = useAuthStore()

  const clearLocalStorage = () => {
    try {
      // Clear all Breezie related data
      localStorage.removeItem('auth-storage')
      localStorage.removeItem('breezie_current_user')
      localStorage.removeItem('breezie_session')
      localStorage.removeItem('emotion-storage')
      localStorage.removeItem('emotion-database-storage')
      localStorage.removeItem('supabase-storage')
      
      // Clear all Supabase related data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear session storage as well
      sessionStorage.clear()
      
      toast.success('本地存储已清理完成')
      return true
    } catch (error) {
      toast.error('清理本地存储时出错')
      return false
    }
  }

  const performCompleteCleanup = async () => {
    if (!email.trim()) {
      toast.error('请输入要删除的邮箱地址')
      return
    }

    setIsLoading(true)
    
    try {
      // Step 1: Clear local storage first
      const localCleared = clearLocalStorage()
      
      // Step 2: Logout current user if any
      if (user) {
        await logout()
      }
      
      // Step 3: Call cleanup API
      const response = await fetch('/api/cleanup-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      })

      const result = await response.json()
      setCleanupResult(result)

      if (result.success) {
        toast.success('用户账号删除成功！可以重新注册了')
      } else {
        toast.warning('部分清理完成，但需要手动处理Supabase Auth系统')
      }

    } catch (error) {
      console.error('Cleanup error:', error)
      toast.error('清理过程中出现错误')
      setCleanupResult({
        success: false,
        message: '清理过程中出现错误: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const forceSignOut = async () => {
    setIsLoading(true)
    try {
      // Clear local storage
      clearLocalStorage()
      
      // Call signout API
      await fetch('/api/auth/signout', { method: 'POST' })
      
      // Force logout from store
      await logout()
      
      // Reload the page to ensure clean state
      window.location.reload()
      
      toast.success('强制登出成功，页面将刷新')
    } catch (error) {
      toast.error('强制登出时出现错误')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        成功
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        失败
      </Badge>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            完整用户账号删除工具
          </CardTitle>
          <CardDescription>
            彻底删除用户账号，包括数据库记录、认证信息和本地存储
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">要删除的邮箱地址:</label>
            <Input
              type="email"
              placeholder="输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={performCompleteCleanup}
              disabled={isLoading || !email.trim()}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  完整删除账号
                </>
              )}
            </Button>

            <Button 
              onClick={forceSignOut}
              disabled={isLoading}
              variant="outline"
            >
              <Key className="w-4 h-4 mr-2" />
              强制登出
            </Button>

            <Button 
              onClick={clearLocalStorage}
              disabled={isLoading}
              variant="outline"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              清理本地存储
            </Button>
          </div>

          {cleanupResult && (
            <div className="mt-6 space-y-4">
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">清理结果</h3>
                  {getStatusBadge(cleanupResult.success)}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>总体状态:</strong> {cleanupResult.message}
                  </p>

                  {cleanupResult.database_cleanup && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">数据库清理</span>
                      </div>
                      <div className="ml-6 text-sm space-y-1">
                        <p>• 找到用户资料: {cleanupResult.database_cleanup.profile_found ? '是' : '否'}</p>
                        <p>• 清理用户资料: {cleanupResult.database_cleanup.cleaned_profile ? '是' : '否'}</p>
                      </div>
                    </div>
                  )}

                  {cleanupResult.auth_status && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">认证系统状态</span>
                      </div>
                      <div className="ml-6 text-sm space-y-1">
                        <p>• 状态: {cleanupResult.auth_status.status}</p>
                        <p>• 详情: {cleanupResult.auth_status.message}</p>
                        <p>• 被阻止: {cleanupResult.auth_status.blocked ? '是' : '否'}</p>
                      </div>
                    </div>
                  )}

                  {cleanupResult.next_steps && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-yellow-800">下一步操作:</p>
                          <p className="text-sm text-yellow-700 mt-1">{cleanupResult.next_steps}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-800">重要说明:</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• 此操作将永久删除所有用户数据，无法恢复</li>
                  <li>• 如果Supabase Auth中仍有用户记录，需要在Supabase Dashboard中手动删除</li>
                  <li>• 删除完成后可以使用相同邮箱重新注册</li>
                  <li>• 建议删除后清除浏览器缓存并重启浏览器</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
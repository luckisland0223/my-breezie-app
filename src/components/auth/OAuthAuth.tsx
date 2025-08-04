'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { getSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Github, Mail } from 'lucide-react'

interface OAuthAuthProps {
  onSuccess?: () => void
}

export function OAuthAuth({ onSuccess }: OAuthAuthProps) {
  const { setUser, setSession, setLoading } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  // Google OAuth登录
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      console.log('Attempting Google OAuth login...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google login error:', error)
        toast.error(`Google登录失败: ${error.message}`)
        return
      }

      console.log('Google OAuth initiated successfully')
      // OAuth会重定向，不需要在这里处理成功状态
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error(`Google登录失败: ${error.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  // GitHub OAuth登录
  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      console.log('Attempting GitHub OAuth login...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'read:user user:email'
        }
      })

      if (error) {
        console.error('GitHub login error:', error)
        toast.error(`GitHub登录失败: ${error.message}`)
        return
      }

      console.log('GitHub OAuth initiated successfully')
      // OAuth会重定向，不需要在这里处理成功状态
    } catch (error: any) {
      console.error('GitHub login error:', error)
      toast.error(`GitHub登录失败: ${error.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>第三方登录</CardTitle>
        <p className="text-sm text-gray-600">
          使用第三方账号快速登录
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700"
          variant="outline"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          ) : (
            <Mail className="w-4 h-4 mr-2 text-red-500" />
          )}
          使用 Google 登录
        </Button>

        <Button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white border-2 border-gray-900"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Github className="w-4 h-4 mr-2" />
          )}
          使用 GitHub 登录
        </Button>

        {/* Debug info */}
        <div className="text-xs text-center text-gray-400 mt-4">
          回调地址: {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''}
        </div>

        <div className="text-xs text-center text-gray-500">
          登录即表示您同意我们的服务条款和隐私政策
        </div>
      </CardContent>
    </Card>
  )
}
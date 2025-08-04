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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Google login error:', error)
        toast.error('Google登录失败')
        return
      }

      // OAuth会重定向，不需要在这里处理成功状态
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Google登录失败')
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('GitHub login error:', error)
        toast.error('GitHub登录失败')
        return
      }

      // OAuth会重定向，不需要在这里处理成功状态
    } catch (error) {
      console.error('GitHub login error:', error)
      toast.error('GitHub登录失败')
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>选择登录方式</CardTitle>
        <p className="text-sm text-gray-600">
          使用第三方账号快速登录
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <Mail className="w-4 h-4 mr-2" />
          使用 Google 登录
        </Button>

        <Button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <Github className="w-4 h-4 mr-2" />
          使用 GitHub 登录
        </Button>

        <div className="text-xs text-center text-gray-500">
          登录即表示您同意我们的服务条款和隐私政策
        </div>
      </CardContent>
    </Card>
  )
}
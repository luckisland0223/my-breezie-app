'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import { Github, Mail, AlertCircle, CheckCircle } from 'lucide-react'

interface ImprovedOAuthProps {
  onSuccess?: () => void
}

export function ImprovedOAuth({ onSuccess }: ImprovedOAuthProps) {
  const { setUser, setSession, setLoading } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  // 测试Supabase连接
  const testConnection = async () => {
    setConnectionStatus('testing')
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        setConnectionStatus('success')
        toast.success('Database connection successful')
      } else {
        setConnectionStatus('error')
        toast.error('Database connection failed')
      }
    } catch (error) {
      setConnectionStatus('error')
      toast.error('Unable to connect to service')
    }
  }

  // 简化的Google登录 - 使用弹窗方式
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setLoading(true)

    try {
      // 模拟Google OAuth登录流程
      const mockUser = {
        id: 'google_' + Date.now(),
        email: 'demo@google.com',
        user_name: 'Google User',
        avatar_url: 'https://via.placeholder.com/100',
        created_at: new Date().toISOString()
      }

      const mockSession = {
        user: mockUser,
        access_token: 'mock_google_token_' + Date.now(),
        refresh_token: 'mock_refresh_token',
        expires_at: Date.now() + 3600000, // 1 hour
        expires_in: 3600
      }

      // 设置用户状态
      setUser(mockUser)
      setSession(mockSession)
      
      // 保存到localStorage
      localStorage.setItem('breezie_current_user', JSON.stringify(mockUser))
      localStorage.setItem('breezie_session', JSON.stringify(mockSession))

      toast.success('Google login successful! (Demo mode)')
      onSuccess?.()
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error(`Google login failed: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  // 简化的GitHub登录
  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setLoading(true)

    try {
      // 模拟GitHub OAuth登录流程
      const mockUser = {
        id: 'github_' + Date.now(),
        email: 'demo@github.com',
        user_name: 'GitHub User',
        avatar_url: 'https://github.com/identicons/github.png',
        created_at: new Date().toISOString()
      }

      const mockSession = {
        user: mockUser,
        access_token: 'mock_github_token_' + Date.now(),
        refresh_token: 'mock_refresh_token',
        expires_at: Date.now() + 3600000, // 1 hour
        expires_in: 3600
      }

      // 设置用户状态
      setUser(mockUser)
      setSession(mockSession)
      
      // 保存到localStorage
      localStorage.setItem('breezie_current_user', JSON.stringify(mockUser))
      localStorage.setItem('breezie_session', JSON.stringify(mockSession))

      toast.success('GitHub login successful! (Demo mode)')
      onSuccess?.()
    } catch (error: any) {
      console.error('GitHub login error:', error)
      toast.error(`GitHub login failed: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {connectionStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {connectionStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          Social Login
        </CardTitle>
        <p className="text-sm text-gray-600">
          Quick login with third-party accounts (Demo mode)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Test */}
        <Button
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          variant="outline"
          className="w-full text-sm"
        >
          {connectionStatus === 'testing' ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          ) : null}
          {connectionStatus === 'testing' ? '测试连接中...' : '测试数据库连接'}
        </Button>

        {/* Google Login */}
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-red-300 text-gray-700"
          variant="outline"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          ) : (
            <Mail className="w-4 h-4 mr-2 text-red-500" />
          )}
          Sign in with Google
        </Button>

        {/* GitHub Login */}
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
          Sign in with GitHub
        </Button>

        {/* Status Info */}
        <div className="text-xs text-center text-gray-500 space-y-1">
          <div>Current mode: Demo mode (Local simulation login)</div>
          <div>Status: {connectionStatus === 'success' ? '✅ Connected' : connectionStatus === 'error' ? '❌ Connection failed' : '⚪ Not tested'}</div>
        </div>

        <div className="text-xs text-center text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </Card>
  )
}
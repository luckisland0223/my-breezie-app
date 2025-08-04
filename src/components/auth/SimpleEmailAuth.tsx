'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react'
import { ImprovedOAuth } from './ImprovedOAuth'

interface SimpleEmailAuthProps {
  onSuccess?: () => void
}

export function SimpleEmailAuth({ onSuccess }: SimpleEmailAuthProps) {
  const { setUser, setSession, setLoading } = useAuthStore()
  
  // Form states
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'oauth'>('oauth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean | null
    message: string
  }>({ available: null, message: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidPassword = (password: string) => {
    return password.length >= 6
  }

  const canSubmit = () => {
    if (activeTab === 'signin') {
      return isValidEmail(email) && isValidPassword(password) && !isSubmitting
    } else {
      return (
        isValidEmail(email) && 
        isValidPassword(password) && 
        password === confirmPassword &&
        userName.trim().length >= 2 &&
        usernameStatus.available === true &&
        !isSubmitting
      )
    }
  }

  // 检查用户名可用性
  const checkUsername = async (username: string) => {
    if (username.length < 2) {
      setUsernameStatus({ available: false, message: 'Username must be at least 2 characters long' })
      return
    }

    setIsCheckingUsername(true)
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() })
      })

      const data = await response.json()
      setUsernameStatus({
        available: data.available,
        message: data.message || data.error || ''
      })
    } catch (error) {
      console.error('Username check error:', error)
      setUsernameStatus({ available: false, message: 'Failed to check username' })
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // 用户名输入防抖
  useEffect(() => {
    if (userName.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        checkUsername(userName.trim())
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setUsernameStatus({ available: null, message: '' })
    }
  }, [userName])

  // Handle sign in
  const handleSignIn = async () => {
    setIsSubmitting(true)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Sign in failed')
        return
      }

      // Set user and session in store
      setUser(data.user)
      setSession(data.session)
      localStorage.setItem('breezie_current_user', JSON.stringify(data.user))
      localStorage.setItem('breezie_session', JSON.stringify(data.session))
      
      toast.success('Successfully signed in!')
      onSuccess?.()

    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Sign in failed. Please try again.')
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Handle sign up
  const handleSignUp = async () => {
    setIsSubmitting(true)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          userName: userName.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Sign up failed')
        return
      }

      // Set user and session in store
      setUser(data.user)
      setSession(data.session)
      localStorage.setItem('breezie_current_user', JSON.stringify(data.user))
      localStorage.setItem('breezie_session', JSON.stringify(data.session))
      
      toast.success('Account created and signed in successfully!')
      onSuccess?.()

    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('Sign up failed. Please try again.')
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit()) return

    if (activeTab === 'signin') {
      await handleSignIn()
    } else {
      await handleSignUp()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Welcome to Breezie
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sign in to your account or create a new one
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup' | 'oauth')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">邮箱登录</TabsTrigger>
            <TabsTrigger value="signup">注册账号</TabsTrigger>
            <TabsTrigger value="oauth">第三方登录</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <TabsContent value="signin" className="space-y-4 mt-0">
              {/* Sign In Form */}
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-0">
              {/* Sign Up Form */}
              <div>
                <Label htmlFor="signup-username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a unique username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="pl-10"
                    required
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-3 top-3">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {userName && usernameStatus.message && (
                  <p className={`text-xs mt-1 ${
                    usernameStatus.available === true ? 'text-green-600' : 
                    usernameStatus.available === false ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
                {userName && userName.length >= 2 && usernameStatus.available === null && !isCheckingUsername && (
                  <p className="text-xs mt-1 text-gray-500">
                    Letters, numbers, underscores, and hyphens only
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <p className={`text-xs mt-1 ${isValidPassword(password) ? 'text-green-600' : 'text-red-600'}`}>
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {confirmPassword && (
                  <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}
              </div>
            </TabsContent>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!canSubmit()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {activeTab === 'signin' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <TabsContent value="oauth" className="mt-0">
            <ImprovedOAuth onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>

        {/* Database Info */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 text-center">
            <strong>Cloud Version:</strong> Your data is securely stored and synced across devices
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
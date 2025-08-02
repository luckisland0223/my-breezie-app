'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseStore } from '@/store/supabase'
import { useAuthStore } from '@/store/auth'
import { getSupabaseClient, resetSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

interface EmailAuthProps {
  onSuccess?: () => void
}

export function EmailAuth({ onSuccess }: EmailAuthProps) {
  const { config, isReady } = useSupabaseStore()
  const { setSession, setLoading, isLoading } = useAuthStore()
  
  // Form states
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
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
        fullName.trim().length >= 2 &&
        !isSubmitting
      )
    }
  }

  // Handle sign in
  const handleSignIn = async () => {
    if (!isReady()) {
      toast.error('Please configure Supabase first')
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const client = getSupabaseClient()
      
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        throw error
      }

      if (data.session) {
        setSession(data.session)
        toast.success('Successfully signed in!')
        onSuccess?.()
      }

    } catch (error: any) {
      console.error('Sign in error:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email address first')
      } else {
        toast.error(`Sign in failed: ${error.message}`)
      }
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  // Handle sign up
  const handleSignUp = async () => {
    if (!isReady()) {
      toast.error('Please configure Supabase first')
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const client = getSupabaseClient()
      
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        if (data.session) {
          // User is automatically signed in
          setSession(data.session)
          toast.success('Account created and signed in successfully!')
          onSuccess?.()
        } else {
          // Email confirmation required
          toast.success('Account created! Please check your email to confirm your account.')
          setActiveTab('signin')
        }
      }

    } catch (error: any) {
      console.error('Sign up error:', error)
      
      if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists')
      } else {
        toast.error(`Sign up failed: ${error.message}`)
      }
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

  if (!isReady()) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Supabase Not Configured
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-4">
            Please configure your Supabase connection first.
          </p>
          <p className="text-sm text-gray-500">
            You need to provide your Supabase Project URL and API Key in the settings.
          </p>
        </CardContent>
      </Card>
    )
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
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
        </Tabs>
      </CardContent>
    </Card>
  )
}
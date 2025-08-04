'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react'

interface SimpleEmailAuthProps {
  onSuccess?: () => void
}

// Simple local storage based authentication (for demo purposes)
interface UserAccount {
  id: string
  email: string
  password: string
  fullName: string
  createdAt: string
}

const USERS_KEY = 'breezie_users'
const CURRENT_USER_KEY = 'breezie_current_user'

// Helper functions for local storage
const getStoredUsers = (): UserAccount[] => {
  try {
    const users = localStorage.getItem(USERS_KEY)
    return users ? JSON.parse(users) : []
  } catch {
    return []
  }
}

const saveUser = (user: UserAccount) => {
  const users = getStoredUsers()
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const findUser = (email: string, password: string): UserAccount | null => {
  const users = getStoredUsers()
  return users.find(user => user.email === email && user.password === password) || null
}

const userExists = (email: string): boolean => {
  const users = getStoredUsers()
  return users.some(user => user.email === email)
}

export function SimpleEmailAuth({ onSuccess }: SimpleEmailAuthProps) {
  const { setUser, setLoading } = useAuthStore()
  
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
    setIsSubmitting(true)
    setLoading(true)

    try {
      const user = findUser(email.trim(), password)
      
      if (!user) {
        toast.error('Invalid email or password')
        return
      }

      // Create session-like object
      const sessionUser = {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        created_at: user.createdAt
      }

      setUser(sessionUser)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser))
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
      if (userExists(email.trim())) {
        toast.error('An account with this email already exists')
        return
      }

      const newUser: UserAccount = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        email: email.trim(),
        password: password,
        fullName: fullName.trim(),
        createdAt: new Date().toISOString()
      }

      saveUser(newUser)

      // Auto sign in after registration
      const sessionUser = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.fullName,
        created_at: newUser.createdAt
      }

      setUser(sessionUser)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser))
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

        {/* Demo Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 text-center">
            <strong>Demo Version:</strong> User data is stored locally in your browser
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
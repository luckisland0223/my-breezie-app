'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, LogIn, Heart, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function PremiumLoginPage() {
  const router = useRouter()
  const { login, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login({ email, password })
    if (useAuthStore.getState().user) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen gradient-surface">
      {/* Premium Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Breezie
                </h1>
                <p className="text-xs text-gray-500">Feeling first, healing follows</p>
              </div>
            </Link>
            
            <Button variant="ghost" onClick={() => router.push('/')} className="glass-subtle hover:shadow-md transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Premium Login Form */}
      <div className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-glow">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">
              Continue your emotional wellness journey with Breezie
            </p>
          </div>

          {/* Premium Form Card */}
          <Card className="glass shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Sign in to your account
              </CardTitle>
              <p className="text-sm text-gray-600">
                Enter your credentials to access your personal space
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="email" 
                      className="pl-12 h-12 glass-subtle border-0 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl" 
                      placeholder="you@example.com" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="password" 
                      className="pl-12 pr-12 h-12 glass-subtle border-0 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl" 
                      placeholder="Enter your password" 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      aria-label="Toggle password visibility" 
                      onClick={() => setShowPassword((v) => !v)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="glass-subtle border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}
                
                <Button 
                  disabled={loading} 
                  type="submit" 
                  className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors" 
                      onClick={() => router.push('/register')}
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


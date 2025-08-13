'use client'

import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth'
import { ArrowLeft, Eye, EyeOff, Heart, Lock, LogIn, Mail, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
    <div className="gradient-surface min-h-screen">
      {/* Premium Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                <CloudLogo size={24} />
              </div>
              <div>
                <CloudLogoText size="md" />
                <p className="text-gray-500 text-xs">Feeling first, healing follows</p>
              </div>
            </Link>
            
            <Button variant="ghost" onClick={() => router.push('/')} className="glass-subtle transition-all duration-200 hover:shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Premium Login Form */}
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 animate-glow items-center justify-center rounded-2xl bg-white shadow-xl">
              <CloudLogo size={50} />
            </div>
            <h2 className="mb-2 font-bold text-3xl text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">
              Continue your emotional wellness journey with Breezie
            </p>
          </div>

          {/* Premium Form Card */}
          <Card className="glass border-0 shadow-2xl">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="font-semibold text-gray-800 text-xl">
                Sign in to your account
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Enter your credentials to access your personal space
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="font-medium text-gray-700 text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                    <Input 
                      id="email" 
                      className="glass-subtle h-12 rounded-xl border-0 pl-12 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" 
                      placeholder="you@example.com" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="font-medium text-gray-700 text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-gray-400" />
                    <Input 
                      id="password" 
                      className="glass-subtle h-12 rounded-xl border-0 pr-12 pl-12 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" 
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
                      className="-translate-y-1/2 absolute top-1/2 right-4 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="glass-subtle rounded-xl border-red-200 p-4">
                    <p className="font-medium text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <Button 
                  disabled={loading} 
                  type="submit" 
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      className="font-medium text-blue-600 transition-colors hover:text-blue-700" 
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
            <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


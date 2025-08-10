'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { UserPlus, User, Mail, Lock, Heart, ArrowLeft, Sparkles, CheckCircle, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PremiumRegisterPage() {
  const router = useRouter()
  const { register, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const success = await register({ email, username, password })
    if (success) {
      router.push('/')
    }
  }

  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains at least one number', met: /\d/.test(password) }
  ]

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

      {/* Premium Registration Form */}
      <div className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-glow">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Breezie</h2>
            <p className="text-gray-600">
              Start your journey to emotional wellness and personal growth
            </p>
          </div>

          {/* Premium Form Card */}
          <Card className="glass shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Create your account
              </CardTitle>
              <p className="text-sm text-gray-600">
                Join thousands finding their path to emotional wellness
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
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="username" 
                      className="pl-12 h-12 glass-subtle border-0 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl" 
                      placeholder="Choose a unique username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Letters, numbers, and underscores only
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      id="password" 
                      className="pl-12 h-12 glass-subtle border-0 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl" 
                      placeholder="Create a strong password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  {/* Premium Password Requirements */}
                  <div className="glass-subtle rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Password Requirements</span>
                    </div>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.met ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {req.met ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {error && (
                  <div className="glass-subtle border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}
                
                <Button 
                  disabled={loading || !passwordRequirements.every(req => req.met)} 
                  type="submit" 
                  className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors" 
                      onClick={() => router.push('/login')}
                    >
                      Sign in here
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
                <Shield className="w-4 h-4" />
                <span>Secure Registration</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


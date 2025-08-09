'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type AuthState } from '@/store/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, login } = useAuthStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  // Redirect if already verified or not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else if (user.emailVerified) {
      router.push('/')
    }
  }, [user, router])

  async function onVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code })
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        // Update the user state to reflect email verification
        useAuthStore.setState((state: AuthState) => ({
          ...state,
          user: state.user ? { ...state.user, emailVerified: true } : null
        }))
        
        router.push('/')
      } else {
        let errorMessage = data.error || 'Verification failed'
        if (res.status === 400 && data.error?.includes('expired')) {
          errorMessage = 'Verification code expired, please resend'
        } else if (res.status === 400 && data.error?.includes('Invalid')) {
          errorMessage = 'Invalid verification code, please check and retry'
        }
        setError(errorMessage)
      }
    } catch (error) {
      setError('Network error, please try again later')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!user) return
    
    setResendLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/verify/resend', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email: user.email }) 
      })
      
      if (res.ok) {
        setError('New verification code sent to your email')
        setTimeout(() => setError(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to resend verification code')
      }
    } catch {
      setError('Network error, please try again')
    } finally {
      setResendLoading(false)
    }
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (user.emailVerified) {
    return null // Will redirect to home
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="w-5 h-5" /> Verify Your Email
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            We sent a verification code to <strong>{user.email}</strong>. 
            Please enter it below to access your account.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={onVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input 
                id="code" 
                placeholder="Enter 6-digit code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                required 
              />
              <div className="text-xs text-muted-foreground">
                The code expires in 15 minutes. Check your spam folder if you don't see it.
              </div>
            </div>
            
            {error && (
              <div className={`text-sm ${error.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>
                {error}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                disabled={resendLoading}
                onClick={handleResend}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
                Resend
              </Button>
            </div>
            
            <div className="text-center">
              <button 
                type="button" 
                className="text-sm text-muted-foreground underline" 
                onClick={() => {
                  useAuthStore.getState().logout()
                  router.push('/register')
                }}
              >
                Use different email
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
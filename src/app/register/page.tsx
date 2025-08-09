'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, processPendingSave } from '@/store/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { UserPlus, User, Mail, Lock, RefreshCw } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'register' | 'verify'>('register')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const success = await register({ email, username, password })
    if (success) {
      setStep('verify')
    }
  }

  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)

  async function onVerify(e: React.FormEvent) {
    e.preventDefault()
    setVerifyLoading(true)
    setVerifyError('')
    
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        // auto login after verify
        await useAuthStore.getState().login({ email, password })
        await processPendingSave()
        router.push('/')
      } else {
        let errorMessage = data.error || 'Verification failed'
        if (res.status === 400 && data.error?.includes('expired')) {
          errorMessage = 'Verification code expired, please resend'
        } else if (res.status === 400 && data.error?.includes('Invalid')) {
          errorMessage = 'Invalid verification code, please check and retry'
        }
        setVerifyError(errorMessage)
      }
    } catch (error) {
      setVerifyError('Network error, please try again later')
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Create your Breezie account
          </CardTitle>
          <p className="text-sm text-muted-foreground">Please fill the form. Password must meet the requirements below.</p>
        </CardHeader>
        <CardContent className="pt-2">
          {step === 'register' ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="username" className="pl-9" placeholder="letters / numbers / underscore" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" className="pl-9" placeholder="At least 8 chars, with upper/lowercase & number" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                <li>At least 8 characters</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
              </ul>
            </div>
            {error ? <div className="text-red-500 text-sm">{error}</div> : null}
            <Button disabled={loading} type="submit" className="w-full">{loading ? 'Registering...' : 'Register'}</Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account? <button type="button" className="underline" onClick={() => router.push('/login')}>Sign in</button>
            </div>
          </form>
          ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input id="code" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} required />
              <div className="text-xs text-muted-foreground">We sent a 6-digit code to your email. It expires in 15 minutes.</div>
            </div>
            {verifyError && <div className="text-red-500 text-sm">{verifyError}</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={verifyLoading} className="w-full">
                {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
              <Button type="button" variant="outline" onClick={async () => {
                try {
                  const res = await fetch('/api/auth/verify/resend', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ email }) 
                  })
                  if (res.ok) {
                    setVerifyError('')
                    // Show success message briefly
                    setVerifyError('New verification code sent')
                    setTimeout(() => setVerifyError(''), 3000)
                  } else {
                    const data = await res.json()
                    setVerifyError(data.error || 'Resend failed')
                  }
                } catch {
                  setVerifyError('Network error, please try again')
                }
              }}><RefreshCw className="w-4 h-4 mr-2" />Resend</Button>
            </div>
            <div className="text-center">
              <button type="button" className="text-sm text-muted-foreground underline" onClick={() => setStep('register')}>
                Back to register
              </button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


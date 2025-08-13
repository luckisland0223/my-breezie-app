'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { processPendingSave, useAuthStore } from '@/store/auth'
import { Eye, EyeOff, Lock, LogIn, Mail, RefreshCw, User, UserPlus } from 'lucide-react'
import { useState } from 'react'

export function AuthDialog({ open, mode = 'login', onOpenChange }: { open: boolean; mode?: 'login' | 'register'; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>(mode)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Welcome to Breezie</DialogTitle>
          <DialogDescription>Sign in to continue, or create a new account in seconds.</DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          {tab === 'login' ? (
            <LoginForm onDone={() => onOpenChange(false)} />
          ) : (
            <RegisterForm onDone={() => onOpenChange(false)} />
          )}
          <div className="mt-4 text-center text-muted-foreground text-sm">
            {tab === 'login' ? (
              <>
                No account?{' '}
                <button type="button" className="underline" onClick={() => setTab('register')}>Register</button>
              </>
            ) : (
              <>
                Have an account?{' '}
                <button type="button" className="underline" onClick={() => setTab('login')}>Sign in</button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const { login, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login({ email, password })
    if (useAuthStore.getState().user) {
      await processPendingSave()
      onDone()
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <div className="relative">
          <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input id="login-email" className="h-12 pl-10 text-base" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input id="login-password" className="h-12 pr-10 pl-10 text-base" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((v) => !v)} className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {error ? <div className="text-red-500 text-sm">{error}</div> : null}
      <Button disabled={loading} type="submit" className="h-12 w-full text-base">{loading ? 'Signing in...' : 'Sign in'}</Button>
    </form>
  )
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const { register, login, loading, error } = useAuthStore()
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await register({ email, username, password })
    setStep('verify')
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) })
    const data = await res.json()
    if (res.ok && data.success) {
      await login({ email, password })
      await processPendingSave()
      onDone()
    }
  }

  return step === 'register' ? (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <div className="relative">
          <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input id="reg-email" className="h-12 pl-10 text-base" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-username">Username</Label>
        <div className="relative">
          <User className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input id="reg-username" className="h-12 pl-10 text-base" placeholder="letters / numbers / underscore" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <div className="relative">
          <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input id="reg-password" className="h-12 pl-10 text-base" placeholder="At least 8 chars, with upper/lowercase & number" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs">
          <li>At least 8 characters</li>
          <li>Contains uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
        </ul>
      </div>
      {error ? <div className="text-red-500 text-sm">{error}</div> : null}
      <Button disabled={loading} type="submit" className="h-12 w-full text-base">{loading ? 'Registering...' : 'Register'}</Button>
    </form>
  ) : (
    <form onSubmit={onVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Verification code</Label>
        <Input id="code" className="h-12 text-base" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <div className="text-muted-foreground text-xs">We sent a 6-digit code to your email. It expires in 15 minutes.</div>
      </div>
      <Button type="submit" className="h-12 w-full text-base">Verify & Continue</Button>
    </form>
  )
}


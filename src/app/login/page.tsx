'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, processPendingSave } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error, user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login({ email, password })
    if (useAuthStore.getState().user) {
      // Try to process any pending save after login
      await processPendingSave()
      router.push('/')
    }
  }

  return (
    <div className="mx-auto max-w-sm p-4">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-3">
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <div className="text-red-500 text-sm">{error}</div> : null}
            <Button disabled={loading} type="submit" className="w-full">{loading ? 'Signing in...' : 'Sign in'}</Button>
            <Button variant="ghost" type="button" className="w-full" onClick={() => router.push('/register')}>Go to Register</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


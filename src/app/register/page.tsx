'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, processPendingSave } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await register({ email, username, password })
    if (useAuthStore.getState().user) {
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
            <Input placeholder="Username (letters/numbers/underscore)" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input placeholder="Password (≥8 chars, upper/lowercase & number)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <div className="text-red-500 text-sm">{error}</div> : null}
            <Button disabled={loading} type="submit" className="w-full">{loading ? 'Registering...' : 'Register'}</Button>
            <Button variant="ghost" type="button" className="w-full" onClick={() => router.push('/login')}>Already have an account? Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cloud } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { SimpleEmailAuth } from '@/components/auth/SimpleEmailAuth'

export default function SignIn() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/')
    }
  }, [isLoggedIn, router])

  const handleAuthSuccess = () => {
    router.push('/')
  }

  if (isLoggedIn) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Cloud className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Breezie</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Your emotional wellness companion
          </p>
        </div>

        {/* Authentication Form */}
        <div className="flex flex-col items-center space-y-6">
          <SimpleEmailAuth onSuccess={handleAuthSuccess} />
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
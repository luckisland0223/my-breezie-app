'use client'

import { ChatInterface } from '@/components/ChatInterface'
import { PageHeader } from '@/components/PageHeader'
import { CloudLogo } from '@/components/ui/CloudLogo'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChatPage() {
  const { user, token } = useAuthStore()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !token) {
      router.push('/')
      return
    }
  }, [user, token, router])

  // Show loading while checking auth
  if (!user || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-white shadow-2xl">
            <CloudLogo size={50} />
          </div>
          <h2 className="mb-2 font-semibold text-gray-800 text-xl">Checking authentication...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageHeader
        title="Chat with Breezie"
        subtitle="Your AI companion for emotional support and guidance"
        showBackButton={true}
        backUrl="/app"
        showHomeLink={true}
      />
      
      <div className="mx-auto max-w-4xl px-6 py-8">
        <ChatInterface onBack={() => router.push('/app')} />
      </div>
    </div>
  )
}

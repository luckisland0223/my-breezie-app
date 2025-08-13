'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { ChatInterface } from '@/components/ChatInterface'
import { PageHeader } from '@/components/PageHeader'
import { CloudLogo } from '@/components/ui/CloudLogo'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float shadow-2xl">
            <CloudLogo size={50} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Checking authentication...</h2>
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
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <ChatInterface onBack={() => router.push('/app')} />
      </div>
    </div>
  )
}

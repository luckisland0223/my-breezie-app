'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'

export default function ChatPage() {
  const router = useRouter()

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Chat Page Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <CloudLogo size={24} />
              </div>
              <span className="font-semibold text-gray-900">Chat with Breezie</span>
            </div>
            
            <div className="w-32 flex justify-end">
              {/* Placeholder for balance */}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface onBack={handleBackToHome} />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
  showHomeLink?: boolean
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBackButton = true, 
  backUrl = '/',
  showHomeLink = true 
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backUrl === '/') {
      router.push('/')
    } else {
      router.back()
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {showHomeLink && (
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <CloudLogo size={24} />
              </div>
              <div>
                <CloudLogoText size="md" />
                <p className="text-xs text-gray-500">Feeling first, healing follows</p>
              </div>
            </Link>
          )}
          
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          
          {showBackButton && (
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="glass-subtle hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

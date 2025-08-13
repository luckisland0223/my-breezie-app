'use client'

import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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
    <header className="sticky top-0 z-40 border-white/20 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {showHomeLink && (
            <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                <CloudLogo size={24} />
              </div>
              <div>
                <CloudLogoText size="md" />
                <p className="text-gray-500 text-xs">Feeling first, healing follows</p>
              </div>
            </Link>
          )}
          
          <div className="flex-1 text-center">
            <h1 className="font-bold text-2xl text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-gray-600">{subtitle}</p>
            )}
          </div>
          
          {showBackButton && (
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="glass-subtle transition-all duration-200 hover:shadow-md"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

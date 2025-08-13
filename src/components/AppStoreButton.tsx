'use client'

import { Button } from '@/components/ui/button'
import { Smartphone, ExternalLink } from 'lucide-react'

interface AppStoreButtonProps {
  className?: string
  size?: 'sm' | 'lg'
}

export function AppStoreButton({ className = '', size = 'lg' }: AppStoreButtonProps) {
  const handleAppStoreClick = () => {
    // 这里将来替换为真实的App Store链接
    const appStoreUrl = 'https://apps.apple.com/app/breezie'
    
    // 在新窗口打开App Store链接
    window.open(appStoreUrl, '_blank', 'noopener,noreferrer')
  }

  if (size === 'sm') {
    return (
      <Button 
        onClick={handleAppStoreClick}
        className={`bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
        size="sm"
      >
        <Smartphone className="mr-2 h-4 w-4" />
        App Store下载
        <ExternalLink className="ml-2 h-3 w-3" />
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleAppStoreClick}
      className={`bg-black hover:bg-gray-800 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      size="lg"
    >
      <Smartphone className="mr-3 h-6 w-6" />
      在App Store下载
      <ExternalLink className="ml-3 h-5 w-5" />
    </Button>
  )
}

export function AppStoreBadge({ className = '' }: { className?: string }) {
  const handleAppStoreClick = () => {
    const appStoreUrl = 'https://apps.apple.com/app/breezie'
    window.open(appStoreUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button 
      onClick={handleAppStoreClick}
      className={`transition-transform hover:scale-105 ${className}`}
    >
      <div className="flex items-center space-x-3 bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="text-left">
          <div className="text-xs text-gray-300">Download on the</div>
          <div className="text-lg font-semibold">App Store</div>
        </div>
        <Smartphone className="h-8 w-8" />
      </div>
    </button>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmotionSelector } from '@/components/EmotionSelector'
import { ChatInterface } from '@/components/ChatInterface'
import { EmotionTracker } from '@/components/EmotionTracker'
import type { EmotionType } from '@/store/emotion'
import { BarChart3, Home, Cloud } from 'lucide-react'

type AppView = 'home' | 'chat' | 'tracker'

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)

  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setCurrentView('chat')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedEmotion(null)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return selectedEmotion ? (
          <ChatInterface 
            emotion={selectedEmotion} 
            onBack={handleBackToHome} 
          />
        ) : null
      
      case 'tracker':
        return <EmotionTracker />
      
      default:
        return <EmotionSelector onEmotionSelect={handleEmotionSelect} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部导航 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Breezie</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={currentView === 'home' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCurrentView('home')}
              >
                <Home className="w-4 h-4 mr-1" />
                首页
              </Button>
              <Button
                variant={currentView === 'tracker' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCurrentView('tracker')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                轨迹
              </Button>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto">
          <Card className="min-h-[600px]">
            <CardContent className="p-6">
              {renderContent()}
            </CardContent>
          </Card>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Breezie - 你的贴心情绪管理助手</p>
          <p className="mt-1">通过对话和记录，更好地了解和管理自己的情绪</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmotionSelector } from '@/components/EmotionSelector'
import { ChatInterface } from '@/components/ChatInterface'
import { EmotionTracker } from '@/components/EmotionTracker'
import { EmotionAdvice } from '@/components/EmotionAdvice'
import { AchievementBadge } from '@/components/AchievementBadge'
import { SettingsPanel } from '@/components/SettingsPanel'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { BarChart3, Home, Cloud, Heart, TrendingUp, Calendar, Zap, ArrowRight, Sparkles, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

type AppView = 'home' | 'chat' | 'tracker'

export default function HomePage() {
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // Store hooks
  const records = useEmotionStore((state) => state.records)
  const getEmotionStats = useEmotionStore((state) => state.getEmotionStats)
  const getRecentEmotions = useEmotionStore((state) => state.getRecentEmotions)

  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setCurrentView('chat')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedEmotion(null)
  }

  // 获取用户统计数据
  const stats = getEmotionStats()
  const recentEmotions = getRecentEmotions(7) // 最近7天
  const totalRecords = records.length
  const thisWeekRecords = recentEmotions.length

  // 获取最多情绪
  const getMostFrequentEmotion = () => {
    if (recentEmotions.length === 0) return { emotion: '快乐', count: 0 }
    const emotionCounts: { [key: string]: number } = {}
    recentEmotions.forEach(record => {
      const emotion = record.emotionEvaluation?.actualEmotion || record.emotion
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })
    const maxEmotion = Object.entries(emotionCounts).reduce((a, b) => a[1] > b[1] ? a : b)
    return { emotion: maxEmotion[0] as EmotionType, count: maxEmotion[1] }
  }

  const mostFrequent = getMostFrequentEmotion()

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
        return (
          <div className="space-y-8">
            {/* 欢迎区域 */}
            {showWelcome && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">欢迎回来！</h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        今天感觉如何？Breezie 在这里陪伴你，帮助你更好地了解和管理自己的情绪。
                      </p>
                      
                      {/* 快速统计 */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{totalRecords}</div>
                          <div className="text-sm text-gray-500">总记录</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{thisWeekRecords}</div>
                          <div className="text-sm text-gray-500">本周记录</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{mostFrequent.count}</div>
                          <div className="text-sm text-gray-500">主要情绪</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {mostFrequent.emotion}
                        </Badge>
                        <span className="text-sm text-gray-600">是你最近的主要情绪</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowWelcome(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 快速操作区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  快速开始
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => setCurrentView('tracker')}
                  >
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">查看情绪轨迹</span>
                    <span className="text-xs text-gray-500">分析你的情绪模式</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300"
                    onClick={() => setShowWelcome(false)}
                  >
                    <Heart className="w-6 h-6 text-green-600" />
                    <span className="font-medium">开始情绪对话</span>
                    <span className="text-xs text-gray-500">与Breezie聊聊</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 情绪建议 */}
            {totalRecords > 0 && (
              <EmotionAdvice />
            )}

            {/* 成就徽章 */}
            {totalRecords > 0 && (
              <AchievementBadge />
            )}

            {/* 情绪选择器 */}
            <EmotionSelector onEmotionSelect={handleEmotionSelect} />
          </div>
        )
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
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                情绪管理助手
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <ThemeToggle />
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
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              已记录 {totalRecords} 次情绪
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              本周 {thisWeekRecords} 次对话
            </span>
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

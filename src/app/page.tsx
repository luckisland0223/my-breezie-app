'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmotionSelector } from '@/components/EmotionSelector'
import { ChatInterface } from '@/components/ChatInterface'
import { EmotionTracker } from '@/components/EmotionTracker'
import { EmotionAdvice } from '@/components/EmotionAdvice'
// import { AchievementBadge } from '@/components/AchievementBadge'
import { SettingsPanel } from '@/components/SettingsPanel'
import { EmotionCalendar } from '@/components/EmotionCalendar'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { BarChart3, Home, Cloud, Heart, TrendingUp, Calendar, Zap, ArrowRight, Sparkles, Settings } from 'lucide-react'


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

  const handleStartConversation = () => {
    // Hide welcome message
    setShowWelcome(false)
    
    // Scroll to emotion selector and highlight it
    setTimeout(() => {
      const emotionSelector = document.querySelector('[data-emotion-selector]')
      if (emotionSelector) {
        emotionSelector.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        
        // Add temporary highlight effect
        emotionSelector.classList.add('ring-4', 'ring-blue-300', 'ring-opacity-75')
        setTimeout(() => {
          emotionSelector.classList.remove('ring-4', 'ring-blue-300', 'ring-opacity-75')
        }, 3000)
      }
    }, 100)
  }

  // Get user statistics
  const stats = getEmotionStats()
  const recentEmotions = getRecentEmotions(7) // Last 7 days
  const totalRecords = records.length
  const thisWeekRecords = recentEmotions.length

  // Get most frequent emotion
  const getMostFrequentEmotion = () => {
    if (recentEmotions.length === 0) return { emotion: 'Joy' as EmotionType, count: 0 }
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
            {/* Welcome area */}
            {showWelcome && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Welcome back!</h2>
                      </div>
                      <p className="text-gray-600 mb-4">
                        How are you feeling today? Breezie is here to accompany you and help you better understand and manage your emotions.
                      </p>
                      
                      {/* Quick statistics */}
                      <div className="grid grid-cols-3 gap-4 mb-4 items-baseline">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-baseline justify-center min-h-[48px]">
                            <span className="text-3xl font-bold text-blue-600 leading-none">{totalRecords}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">Total Records</div>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-baseline justify-center min-h-[48px]">
                            <span className="text-3xl font-bold text-green-600 leading-none">{thisWeekRecords}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">This Week</div>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-baseline justify-center min-h-[48px]">
                            <span className="text-3xl font-bold text-purple-600 leading-none">{mostFrequent.count}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">Primary Emotion</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {mostFrequent.emotion}
                        </Badge>
                        <span className="text-sm text-gray-600">is your most frequent emotion recently</span>
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

            {/* Quick actions area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Start
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
                    <span className="font-medium">View Emotion Analytics</span>
                    <span className="text-xs text-gray-500">Analyze your emotional patterns</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300"
                    onClick={handleStartConversation}
                  >
                    <Heart className="w-6 h-6 text-green-600" />
                    <span className="font-medium">Start Conversation</span>
                    <span className="text-xs text-gray-500">Chat with Breezie</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emotion Calendar */}
            {totalRecords > 0 && (
              <EmotionCalendar />
            )}

            {/* Emotion advice */}
            {totalRecords > 0 && (
              <EmotionAdvice />
            )}

            {/* Achievement badges - Temporarily hidden */}
            {/* {totalRecords > 0 && (
              <AchievementBadge />
            )} */}

            {/* Emotion selector */}
            <div data-emotion-selector className="rounded-lg transition-all duration-300">
              <EmotionSelector onEmotionSelect={handleEmotionSelect} />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Breezie</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Emotional Wellness Assistant
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={currentView === 'home' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCurrentView('home')}
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
              <Button
                variant={currentView === 'tracker' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCurrentView('tracker')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Analytics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="max-w-4xl mx-auto">
          <Card className="min-h-[600px]">
            <CardContent className="p-6">
              {renderContent()}
            </CardContent>
          </Card>
        </div>

        {/* Footer information */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Breezie - Your Personal Emotional Wellness Assistant</p>
          <p className="mt-1">Better understand and manage your emotions through conversation and tracking</p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {totalRecords} emotions recorded
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {thisWeekRecords} conversations this week
            </span>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

'use client'

import { ClientOnly } from '@/components/ClientOnly'
import { DailyWellnessTip } from '@/components/DailyWellnessTip'
import { EmotionTracker } from '@/components/EmotionTracker'
import { ChatInterface } from '@/components/ChatInterface'
import { QuickEmotionCheck } from '@/components/QuickEmotionCheck'
import { RecentEmotionTrend } from '@/components/RecentEmotionTrend'
import { UserMenu } from '@/components/UserMenu'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth'
import { useEmotionStore } from '@/store/emotion'
import { ArrowRight, BarChart3, Brain, Calendar, CheckCircle, Heart, MessageCircle, Settings, Sparkles, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('journey')
  const { user } = useAuthStore()
  const { records, loadFromServer } = useEmotionStore()
  
  useEffect(() => {
    if (user) {
      loadFromServer()
    }
  }, [user, loadFromServer])

  const handleStartConversation = () => {
    setActiveTab('chat')
  }

  return (
    <div className="gradient-surface min-h-screen">
      {/* App Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 animate-glow items-center justify-center rounded-2xl bg-white shadow-xl">
                <CloudLogo size={32} />
              </div>
              <div>
                <CloudLogoText size="lg" />
                <p className="font-medium text-gray-600 text-sm">Feeling first, healing follows</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/app/chat">
                <Button variant="ghost" className="glass-subtle flex items-center gap-2 transition-all duration-200 hover:shadow-md">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
              </Link>
              
              <Link href="/app/analytics">
                <Button variant="ghost" className="glass-subtle flex items-center gap-2 transition-all duration-200 hover:shadow-md">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main App Content */}
      <ClientOnly fallback={
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-12 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-white shadow-2xl">
              <CloudLogo size={50} />
            </div>
            <h2 className="mb-2 font-semibold text-gray-800 text-xl">Loading your journey...</h2>
            <p className="text-gray-600">Preparing your personalized experience</p>
            <p className="mt-3 text-gray-400 text-sm">Feeling first, healing follows</p>
          </div>
        </div>
      }>
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="glass mx-auto grid h-14 w-full grid-cols-2 p-1 lg:w-96">
              <TabsTrigger value="journey" className="data-[state=active]:glass-subtle flex h-12 items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:shadow-md">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Journey</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:glass-subtle flex h-12 items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:shadow-md">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
            </TabsList>

            {/* Journey Tab */}
            <TabsContent value="journey" className="space-y-8">
              {/* Hero Section */}
              <div className="py-12 text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 animate-float items-center justify-center rounded-3xl bg-white shadow-2xl">
                  <CloudLogo size={80} />
                </div>
                <h2 className="mb-4 font-bold text-4xl">
                  <CloudLogoText size="xl" />
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-gray-600 text-xl leading-relaxed">
                  Your personal AI companion for emotional wellness. Ready to explore your feelings and find your path to inner peace?
                </p>
                
                <Button 
                  size="lg" 
                  className="transform animate-glow rounded-2xl border-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-12 py-6 font-semibold text-lg text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                  onClick={handleStartConversation}
                >
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Start Chatting
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                
                <p className="mt-4 text-gray-500 text-sm">
                  Chat with AI-powered emotional support
                </p>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Quick Emotion Check */}
                <div className="glass rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <QuickEmotionCheck />
                </div>
                
                {/* Daily Wellness Tip */}
                <div className="glass rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <DailyWellnessTip />
                </div>
                
                {/* Recent Emotion Trend - Full Width */}
                <div className="glass rounded-2xl p-6 shadow-xl lg:col-span-2">
                  <RecentEmotionTrend />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="glass-subtle border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="mb-2 font-bold text-3xl text-gray-900">{records.length}</p>
                    <p className="font-medium text-gray-600">Total Records</p>
                    <p className="mt-1 text-gray-500 text-xs">Emotional insights captured</p>
                  </CardContent>
                </Card>
                
                <Card className="glass-subtle border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <p className="mb-2 font-bold text-3xl text-gray-900">
                      {(() => {
                        const chatRecords = records
                          .filter(r => r.recordType === 'chat')
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        
                        if (chatRecords.length === 0) return '0'
                        
                        const recentRecords = chatRecords.slice(0, 5)
                        const totalImpact = recentRecords.reduce((sum, r) => sum + r.behavioralImpact, 0)
                        const avgImpact = totalImpact / recentRecords.length
                        
                        return avgImpact.toFixed(1)
                      })()}
                    </p>
                    <p className="font-medium text-gray-600">Impact Score</p>
                    <p className="mt-1 text-gray-500 text-xs">Recent 5 sessions average</p>
                  </CardContent>
                </Card>
                
                <Card className="glass-subtle border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <p className="mb-2 font-bold text-3xl text-gray-900">
                      {records.filter(r => {
                        const today = new Date()
                        const recordDate = new Date(r.timestamp)
                        return recordDate.toDateString() === today.toDateString()
                      }).length}
                    </p>
                    <p className="font-medium text-gray-600">Today's Check-ins</p>
                    <p className="mt-1 text-gray-500 text-xs">Emotional wellness activities</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Overview Header */}
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl">
                  <CloudLogo size={40} />
                </div>
                <h2 className="mb-3 font-bold text-3xl text-gray-900">Emotional Overview</h2>
                <p className="mx-auto max-w-2xl text-gray-600 text-lg">
                  Deep insights into your emotional journey and personal growth patterns
                </p>
              </div>

              {/* Overview Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Recent Emotion Trend - Full Width */}
                <div className="glass rounded-2xl p-8 shadow-xl lg:col-span-2">
                  <RecentEmotionTrend />
                </div>
                
                {/* Wellness Statistics */}
                <Card className="glass-subtle border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      Wellness Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="glass-subtle rounded-xl p-4 text-center">
                        <div className="mb-1 font-bold text-3xl text-blue-600">{records.length}</div>
                        <div className="font-medium text-gray-600 text-sm">Total Records</div>
                      </div>
                      <div className="glass-subtle rounded-xl p-4 text-center">
                        <div className="mb-1 font-bold text-3xl text-green-600">
                          {(() => {
                            const chatRecords = records.filter(r => r.recordType === 'chat')
                            return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                          })()}
                        </div>
                        <div className="font-medium text-gray-600 text-sm">Avg Impact</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="glass-subtle rounded-xl p-4 text-center">
                        <div className="mb-1 font-bold text-3xl text-purple-600">
                          {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
                        </div>
                        <div className="font-medium text-gray-600 text-sm">Days Tracked</div>
                      </div>
                      <div className="glass-subtle rounded-xl p-4 text-center">
                        <div className="mb-1 font-bold text-3xl text-orange-600">
                          {records.filter(r => {
                            const today = new Date()
                            const recordDate = new Date(r.timestamp)
                            return recordDate.toDateString() === today.toDateString()
                          }).length}
                        </div>
                        <div className="font-medium text-gray-600 text-sm">Today's Records</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emotion Patterns */}
                <Card className="glass-subtle border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-600">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      Emotion Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {records.length > 0 ? (
                      <div className="space-y-4">
                        {(() => {
                          const emotionCounts = records.reduce((acc, record) => {
                            acc[record.emotion] = (acc[record.emotion] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                          
                          return Object.entries(emotionCounts)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([emotion, count], index) => (
                              <div key={emotion} className="glass-subtle flex items-center justify-between rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 font-bold text-sm text-white">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium text-gray-700">{emotion}</span>
                                </div>
                                <Badge variant="secondary" className="font-semibold">
                                  {count} times
                                </Badge>
                              </div>
                            ))
                        })()}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                          <MessageCircle className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="mb-1 font-medium">No patterns yet</p>
                        <p className="text-sm">Start tracking to discover your emotional patterns!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center pt-8">
                <Link href="/app/analytics">
                  <Button className="flex items-center gap-3 border-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-8 py-4 font-medium text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <BarChart3 className="h-5 w-5" />
                    View Detailed Analytics
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-8">
              <div className="glass rounded-2xl p-6 shadow-xl">
                <ChatInterface onBack={() => setActiveTab('journey')} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ClientOnly>

      {/* App Footer */}
      <footer className="glass mt-20 border-t-0">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
              <CloudLogo size={40} />
            </div>
            <p className="mb-2 font-semibold text-gray-800 text-lg">
              <CloudLogoText size="md" /> v1.0
            </p>
            <p className="mb-4 text-gray-600">Feeling first, healing follows</p>
            <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Wellbeing Focused</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Privacy-First</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

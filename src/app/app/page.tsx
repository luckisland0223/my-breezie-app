'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PremiumChatInterface } from '@/components/PremiumChatInterface'
import { EmotionTracker } from '@/components/EmotionTracker'
import { QuickEmotionCheck } from '@/components/QuickEmotionCheck'
import { RecentEmotionTrend } from '@/components/RecentEmotionTrend'
import { DailyWellnessTip } from '@/components/DailyWellnessTip'
import { ClientOnly } from '@/components/ClientOnly'
import { useEmotionStore } from '@/store/emotion'
import { useAuthStore } from '@/store/auth'
import { UserMenu } from '@/components/UserMenu'
import { MessageCircle, BarChart3, Calendar, Settings, Sparkles, ArrowRight, Heart, TrendingUp, Target, Brain, CheckCircle } from 'lucide-react'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('journey')
  const { records, loadFromServer } = useEmotionStore()
  const { user, token, isFullyAuthenticated } = useAuthStore()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user || !token) {
      router.push('/')
      return
    }
  }, [user, token, router])

  useEffect(() => {
    if (token && user) {
      loadFromServer()
    }
  }, [token, user, loadFromServer])

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

  const handleStartConversation = () => {
    setActiveTab('chat')
  }

  return (
    <div className="min-h-screen gradient-surface">
      {/* App Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl animate-glow">
                <CloudLogo size={32} />
              </div>
              <div>
                <CloudLogoText size="lg" />
                <p className="text-sm text-gray-600 font-medium">Feeling first, healing follows</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/app/chat">
                <Button variant="ghost" className="glass-subtle hover:shadow-md transition-all duration-200 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </Button>
              </Link>
              
              <Link href="/app/analytics">
                <Button variant="ghost" className="glass-subtle hover:shadow-md transition-all duration-200 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float shadow-2xl">
              <CloudLogo size={50} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your journey...</h2>
            <p className="text-gray-600">Preparing your personalized experience</p>
            <p className="text-sm text-gray-400 mt-3">Feeling first, healing follows</p>
          </div>
        </div>
      }>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="glass grid w-full grid-cols-2 lg:w-96 mx-auto h-14 p-1">
              <TabsTrigger value="journey" className="flex items-center gap-2 h-12 rounded-xl data-[state=active]:glass-subtle data-[state=active]:shadow-md transition-all duration-200">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Journey</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2 h-12 rounded-xl data-[state=active]:glass-subtle data-[state=active]:shadow-md transition-all duration-200">
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
            </TabsList>

            {/* Journey Tab */}
            <TabsContent value="journey" className="space-y-8">
              {/* Hero Section */}
              <div className="text-center py-12">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
                  <CloudLogo size={80} />
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  <CloudLogoText size="xl" />
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Your personal AI companion for emotional wellness. Ready to explore your feelings and find your path to inner peace?
                </p>
                
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-12 py-6 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-lg animate-glow border-0"
                  onClick={handleStartConversation}
                >
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Start Chatting
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
                
                <p className="text-sm text-gray-500 mt-4">
                  Chat with AI-powered emotional support
                </p>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Emotion Check */}
                <div className="glass rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <QuickEmotionCheck />
                </div>
                
                {/* Daily Wellness Tip */}
                <div className="glass rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <DailyWellnessTip />
                </div>
                
                {/* Recent Emotion Trend - Full Width */}
                <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-xl">
                  <RecentEmotionTrend />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-subtle shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{records.length}</p>
                    <p className="text-gray-600 font-medium">Total Records</p>
                    <p className="text-xs text-gray-500 mt-1">Emotional insights captured</p>
                  </CardContent>
                </Card>
                
                <Card className="glass-subtle shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
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
                    <p className="text-gray-600 font-medium">Impact Score</p>
                    <p className="text-xs text-gray-500 mt-1">Recent 5 sessions average</p>
                  </CardContent>
                </Card>
                
                <Card className="glass-subtle shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {records.filter(r => {
                        const today = new Date()
                        const recordDate = new Date(r.timestamp)
                        return recordDate.toDateString() === today.toDateString()
                      }).length}
                    </p>
                    <p className="text-gray-600 font-medium">Today's Check-ins</p>
                    <p className="text-xs text-gray-500 mt-1">Emotional wellness activities</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Overview Header */}
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <CloudLogo size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Emotional Overview</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Deep insights into your emotional journey and personal growth patterns
                </p>
              </div>

              {/* Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Emotion Trend - Full Width */}
                <div className="lg:col-span-2 glass rounded-2xl p-8 shadow-xl">
                  <RecentEmotionTrend />
                </div>
                
                {/* Wellness Statistics */}
                <Card className="glass-subtle shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      Wellness Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center glass-subtle rounded-xl p-4">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{records.length}</div>
                        <div className="text-sm text-gray-600 font-medium">Total Records</div>
                      </div>
                      <div className="text-center glass-subtle rounded-xl p-4">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {(() => {
                            const chatRecords = records.filter(r => r.recordType === 'chat')
                            return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                          })()}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Avg Impact</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center glass-subtle rounded-xl p-4">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Days Tracked</div>
                      </div>
                      <div className="text-center glass-subtle rounded-xl p-4">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {records.filter(r => {
                            const today = new Date()
                            const recordDate = new Date(r.timestamp)
                            return recordDate.toDateString() === today.toDateString()
                          }).length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Today's Records</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emotion Patterns */}
                <Card className="glass-subtle shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-600 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
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
                              <div key={emotion} className="flex justify-between items-center glass-subtle rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <span className="text-gray-700 font-medium">{emotion}</span>
                                </div>
                                <Badge variant="secondary" className="font-semibold">
                                  {count} times
                                </Badge>
                              </div>
                            ))
                        })()}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium mb-1">No patterns yet</p>
                        <p className="text-sm">Start tracking to discover your emotional patterns!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center pt-8">
                <Link href="/app/analytics">
                  <Button className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 px-8 py-4 text-lg font-medium border-0">
                    <BarChart3 className="w-5 h-5" />
                    View Detailed Analytics
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="space-y-8">
              <div className="glass rounded-2xl p-6 shadow-xl">
                <PremiumChatInterface />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ClientOnly>

      {/* App Footer */}
      <footer className="glass border-t-0 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CloudLogo size={40} />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              <CloudLogoText size="md" /> v1.0
            </p>
            <p className="text-gray-600 mb-4">Feeling first, healing follows</p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Wellbeing Focused</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Privacy-First</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

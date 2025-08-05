'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatInterface } from '@/components/ChatInterface'
import { EmotionTracker } from '@/components/EmotionTracker'
import { QuickEmotionCheck } from '@/components/QuickEmotionCheck'
import { RecentEmotionTrend } from '@/components/RecentEmotionTrend'
import { DailyWellnessTip } from '@/components/DailyWellnessTip'
import { AchievementBadge } from '@/components/AchievementBadge'
import UserProfile from '@/components/UserProfile'
import { useAuthStore } from '@/store/auth'
import { useEmotionStore } from '@/store/emotionDatabase'
import { SyncStatus } from '@/components/SyncStatus'
import { StatusIndicator } from '@/components/StatusIndicator'
import { AuthFixer } from '@/components/AuthFixer'
import { MessageCircle, BarChart3, Calendar, Settings, Sparkles, ArrowRight, Heart, TrendingUp, Target, Database } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const { user, isLoggedIn, isLoading } = useAuthStore()
  const { loadFromDatabase, records } = useEmotionStore()
  const [activeTab, setActiveTab] = useState('journey')
  const [showChat, setShowChat] = useState(false)
  const [authError, setAuthError] = useState(false)

  // Load user data when logged in
  useEffect(() => {
    if (user?.id && isLoggedIn) {
      loadFromDatabase(user.id).catch(() => {
        // If loading fails, it might be an auth issue
        setAuthError(true)
      })
    }
  }, [user?.id, isLoggedIn, loadFromDatabase])

  // Listen for authentication errors from emotion recording
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      if (event.detail?.error?.includes('401') || event.detail?.error?.includes('Authentication')) {
        setAuthError(true)
      }
    }

    window.addEventListener('authError', handleAuthError as EventListener)
    return () => window.removeEventListener('authError', handleAuthError as EventListener)
  }, [])

  const handleStartConversation = () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to start a conversation')
      return
    }
    setShowChat(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your emotional wellness journey...</p>
        </div>
      </div>
    )
  }

  // Show AuthFixer if there's an authentication error
  if (authError && isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <AuthFixer onAuthFixed={() => setAuthError(false)} />
      </div>
    )
  }

  if (showChat) {
    return <ChatInterface onBack={() => setShowChat(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Breezie
                </h1>
                <p className="text-xs text-gray-500">Emotional Wellness Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusIndicator />
              {isLoggedIn && (
                <>
                  <Link href="/analytics">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href="/test-sync">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Test Sync
                    </Button>
                  </Link>
                </>
              )}
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {!isLoggedIn ? (
        /* Welcome Screen for Non-logged Users */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Breezie</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your AI-powered emotional wellness companion. Track your emotions, have meaningful conversations, 
              and discover insights about your emotional patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
                onClick={() => window.location.href = '/auth/signin'}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                  AI Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Have meaningful conversations with our AI assistant that understands your emotions and provides personalized support.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <BarChart3 className="w-6 h-6 text-green-500" />
                  Emotion Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track your emotional patterns over time with detailed analytics and behavioral impact scores.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Calendar className="w-6 h-6 text-purple-500" />
                  Daily Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Keep a daily record of your emotional journey with our intuitive calendar and tracking tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Main App Interface for Logged Users */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-80 mx-auto">
              <TabsTrigger value="journey" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Journey
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
            </TabsList>

            {/* Journey Tab - Enhanced with Multiple Features */}
            <TabsContent value="journey" className="space-y-6">
              {/* Welcome Section with Single CTA */}
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome back, {user?.user_name || 'Friend'}
                </h2>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                  Ready to explore your emotions today? Start a conversation with Breezie or check in with a quick emotion record.
                </p>
                
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={handleStartConversation}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start a Conversation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Sync Status - Only when syncing or has issues */}
              <SyncStatus />

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Emotion Check */}
                <QuickEmotionCheck />
                
                {/* Daily Wellness Tip */}
                <DailyWellnessTip />
                
                {/* Recent Emotion Trend - Full Width */}
                <div className="lg:col-span-2">
                  <RecentEmotionTrend />
                </div>
                
                {/* Achievement Badges - Full Width */}
                <div className="lg:col-span-2">
                  <AchievementBadge />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                    <p className="text-gray-600">Total Records</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {(() => {
                        // Filter chat records and sort by time (newest first)
                        const chatRecords = records
                          .filter(r => r.recordType === 'chat')
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        
                        if (chatRecords.length === 0) {
                          return '0'
                        }
                        
                        // Get the most recent 3 records
                        const recentRecords = chatRecords.slice(0, 3)
                        
                        // Calculate total
                        const totalImpact = recentRecords.reduce((sum, r) => sum + r.behavioralImpact, 0)
                        
                        // Calculate average
                        const avgImpact = totalImpact / recentRecords.length
                        
                        return avgImpact.toFixed(1)
                      })()}
                    </p>
                    <p className="text-gray-600">Avg Impact Score (Recent 3)</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {records.filter(r => {
                        const today = new Date()
                        const recordDate = new Date(r.timestamp)
                        return recordDate.toDateString() === today.toDateString()
                      }).length}
                    </p>
                    <p className="text-gray-600">Today's Check-ins</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Overview Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Emotional Overview</h2>
                <p className="text-gray-600">Quick insights into your emotional journey</p>
              </div>

              {/* Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Emotion Trend - Full Width on Mobile */}
                <div className="lg:col-span-2">
                  <RecentEmotionTrend />
                </div>
                
                {/* Quick Stats Grid */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Emotion Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{records.length}</div>
                        <div className="text-sm text-gray-600">Total Records</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {(() => {
                            const chatRecords = records.filter(r => r.recordType === 'chat')
                            return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                          })()}
                        </div>
                        <div className="text-sm text-gray-600">Avg Impact</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
                        </div>
                        <div className="text-sm text-gray-600">Days Tracked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {records.filter(r => {
                            const today = new Date()
                            const recordDate = new Date(r.timestamp)
                            return recordDate.toDateString() === today.toDateString()
                          }).length}
                        </div>
                        <div className="text-sm text-gray-600">Today's Records</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Most Common Emotions */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Emotion Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {records.length > 0 ? (
                      <div className="space-y-3">
                        {(() => {
                          const emotionCounts = records.reduce((acc, record) => {
                            acc[record.emotion] = (acc[record.emotion] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                          
                          return Object.entries(emotionCounts)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([emotion, count], index) => (
                              <div key={emotion} className="flex justify-between items-center">
                                <span className="text-gray-700">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {emotion}
                                </span>
                                <span className="font-semibold text-gray-900">{count}</span>
                              </div>
                            ))
                        })()}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Start tracking to see patterns!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center">
                <Link href="/analytics">
                  <Button variant="outline" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Detailed Analytics
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Footer information */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              <strong>Breezie v2.0</strong> - Your Emotional Wellness Journey
            </p>
            <p className="text-sm text-gray-500">
              Powered by AI • Designed for Your Wellbeing • Privacy-First Approach
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
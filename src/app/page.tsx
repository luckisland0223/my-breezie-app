'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatInterface } from '@/components/ChatInterface'
import { EmotionTracker } from '@/components/EmotionTracker'
import UserProfile from '@/components/UserProfile'
import { useAuthStore } from '@/store/auth'
import { useEmotionStore } from '@/store/emotionDatabase'
import { SyncStatus } from '@/components/SyncStatus'
import { DatabaseConfigStatus } from '@/components/DatabaseConfigStatus'
import { MessageCircle, BarChart3, Calendar, Settings, Sparkles, ArrowRight, Heart } from 'lucide-react'
import { toast } from 'sonner'

export default function HomePage() {
  const { user, isLoggedIn, isLoading } = useAuthStore()
  const { loadFromDatabase } = useEmotionStore()
  const [activeTab, setActiveTab] = useState('journey')
  const [showChat, setShowChat] = useState(false)

  // Load user data when logged in
  useEffect(() => {
    if (user?.id && isLoggedIn) {
      loadFromDatabase(user.id)
    }
  }, [user?.id, isLoggedIn, loadFromDatabase])

  const handleStartJourney = () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to start your emotional journey')
      return
    }
    setShowChat(true)
  }

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
              <DatabaseConfigStatus />
              <SyncStatus />
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
            <TabsList className="grid w-full grid-cols-3 lg:w-96 mx-auto">
              <TabsTrigger value="journey" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Journey
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tracking
              </TabsTrigger>
            </TabsList>

            {/* Journey Tab - Start Conversations */}
            <TabsContent value="journey" className="space-y-6">
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome back, {user?.user_name || 'Friend'}
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Ready to explore your emotions today? Start a conversation with Breezie to discover insights about your feelings and get personalized support.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                    onClick={handleStartConversation}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start a Conversation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:text-purple-800 px-8 py-4 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                    onClick={handleStartJourney}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start a Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                
                <div className="mt-8 text-sm text-gray-500">
                  <p>💡 Tip: Breezie will help you identify and understand your emotions through conversation</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">Ready</p>
                    <p className="text-gray-600">Start your conversation</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">Safe</p>
                    <p className="text-gray-600">Supportive environment</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">Personal</p>
                    <p className="text-gray-600">Tailored to you</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <EmotionTracker />
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="space-y-6">
              <EmotionTracker />
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
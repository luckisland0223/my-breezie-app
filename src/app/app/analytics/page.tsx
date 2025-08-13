'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useEmotionStore } from '@/store/emotion'
import { PageHeader } from '@/components/PageHeader'
import { CloudLogo } from '@/components/ui/CloudLogo'
import { EmotionChart } from '@/components/EmotionChart'
import { RecentEmotionTrend } from '@/components/RecentEmotionTrend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Target, Calendar, Heart, MessageCircle } from 'lucide-react'

export default function AnalyticsPage() {
  const { user, token } = useAuthStore()
  const { records, loadFromServer } = useEmotionStore()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageHeader
        title="Emotional Analytics"
        subtitle="Track your emotional journey and discover patterns"
        showBackButton={true}
        backUrl="/app"
        showHomeLink={true}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{records.length}</p>
              <p className="text-gray-600 font-medium">Total Records</p>
            </CardContent>
          </Card>

          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {(() => {
                  const chatRecords = records.filter(r => r.recordType === 'chat')
                  return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                })()}
              </p>
              <p className="text-gray-600 font-medium">Avg Impact</p>
            </CardContent>
          </Card>

          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
              </p>
              <p className="text-gray-600 font-medium">Days Tracked</p>
            </CardContent>
          </Card>

          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {new Set(records.map(r => r.emotion)).size}
              </p>
              <p className="text-gray-600 font-medium">Emotions Tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Emotion Chart */}
          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Emotion Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmotionChart records={records} />
            </CardContent>
          </Card>

          {/* Recent Trends */}
          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Recent Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentEmotionTrend />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emotion Patterns */}
          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Top Emotions
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
                      .slice(0, 8)
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
                  <p className="font-medium mb-1">No data yet</p>
                  <p className="text-sm">Start tracking emotions to see your patterns!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Behavioral Impact Analysis */}
          <Card className="glass shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center glass-subtle rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {(() => {
                        const chatRecords = records.filter(r => r.recordType === 'chat')
                        return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                      })()}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Average Impact Score</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center glass-subtle rounded-lg p-3">
                      <div className="text-xl font-bold text-green-600 mb-1">
                        {records.filter(r => r.behavioralImpact >= 7).length}
                      </div>
                      <div className="text-xs text-gray-600">High Impact</div>
                    </div>
                    <div className="text-center glass-subtle rounded-lg p-3">
                      <div className="text-xl font-bold text-orange-600 mb-1">
                        {records.filter(r => r.behavioralImpact >= 4 && r.behavioralImpact < 7).length}
                      </div>
                      <div className="text-xs text-gray-600">Medium Impact</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium mb-1">No impact data</p>
                  <p className="text-sm">Start chatting to see your behavioral impact!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { EmotionChart } from '@/components/EmotionChart'
import { PageHeader } from '@/components/PageHeader'
import { RecentEmotionTrend } from '@/components/RecentEmotionTrend'
import { CloudLogo } from '@/components/ui/CloudLogo'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { useEmotionStore } from '@/store/emotion'
import { BarChart3, Calendar, Heart, MessageCircle, Target, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-white shadow-2xl">
            <CloudLogo size={50} />
          </div>
          <h2 className="mb-2 font-semibold text-gray-800 text-xl">Checking authentication...</h2>
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
      
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <p className="mb-1 font-bold text-2xl text-gray-900">{records.length}</p>
              <p className="font-medium text-gray-600">Total Records</p>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <p className="mb-1 font-bold text-2xl text-gray-900">
                {(() => {
                  const chatRecords = records.filter(r => r.recordType === 'chat')
                  return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                })()}
              </p>
              <p className="font-medium text-gray-600">Avg Impact</p>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <p className="mb-1 font-bold text-2xl text-gray-900">
                {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}
              </p>
              <p className="font-medium text-gray-600">Days Tracked</p>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <p className="mb-1 font-bold text-2xl text-gray-900">
                {new Set(records.map(r => r.emotion)).size}
              </p>
              <p className="font-medium text-gray-600">Emotions Tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Emotion Chart */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Emotion Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmotionChart records={records} />
            </CardContent>
          </Card>

          {/* Recent Trends */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600">
                  <TrendingUp className="h-5 w-5 text-white" />
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Emotion Patterns */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600">
                  <Target className="h-5 w-5 text-white" />
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
                  <p className="mb-1 font-medium">No data yet</p>
                  <p className="text-sm">Start tracking emotions to see your patterns!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Behavioral Impact Analysis */}
          <Card className="glass border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length > 0 ? (
                <div className="space-y-4">
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <div className="mb-1 font-bold text-3xl text-blue-600">
                      {(() => {
                        const chatRecords = records.filter(r => r.recordType === 'chat')
                        return chatRecords.length > 0 ? (chatRecords.reduce((sum, r) => sum + r.behavioralImpact, 0) / chatRecords.length).toFixed(1) : '0'
                      })()}
                    </div>
                    <div className="font-medium text-gray-600 text-sm">Average Impact Score</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-subtle rounded-lg p-3 text-center">
                      <div className="mb-1 font-bold text-green-600 text-xl">
                        {records.filter(r => r.behavioralImpact >= 7).length}
                      </div>
                      <div className="text-gray-600 text-xs">High Impact</div>
                    </div>
                    <div className="glass-subtle rounded-lg p-3 text-center">
                      <div className="mb-1 font-bold text-orange-600 text-xl">
                        {records.filter(r => r.behavioralImpact >= 4 && r.behavioralImpact < 7).length}
                      </div>
                      <div className="text-gray-600 text-xs">Medium Impact</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <TrendingUp className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="mb-1 font-medium">No impact data</p>
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

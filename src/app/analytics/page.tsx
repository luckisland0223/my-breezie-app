'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmotionCalendar } from '@/components/EmotionCalendar'
import { EmotionChart } from '@/components/EmotionChart'
import { useEmotionStore } from '@/store/emotionDatabase'
import { useAuthStore } from '@/store/auth'
import { ArrowLeft, Calendar, BarChart3, Eye, TrendingUp, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { subDays } from 'date-fns'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { records } = useEmotionStore()
  const [timeRange, setTimeRange] = useState<10 | 15 | 30>(30)

  // Filter records based on time range
  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.timestamp)
    const cutoffDate = subDays(new Date(), timeRange)
    return recordDate >= cutoffDate
  })

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view analytics</h1>
          <Button onClick={() => router.push('/')}>Go to Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-xs text-gray-500">Insights into your emotional journey</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emotional Analytics</h2>
            <p className="text-gray-600">Track your emotional journey and behavioral patterns</p>
          </div>

          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Emotion Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmotionCalendar />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emotion Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Emotion Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmotionChart records={filteredRecords} />
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{records.length}</div>
                      <div className="text-sm text-gray-600">Total Records</div>
                    </div>
                    
                    {records.length > 0 && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {(records.reduce((sum, r) => sum + r.behavioralImpact, 0) / records.length).toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Average Impact Score</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {records.filter(r => {
                              const today = new Date()
                              const recordDate = new Date(r.timestamp)
                              return recordDate.toDateString() === today.toDateString()
                            }).length}
                          </div>
                          <div className="text-sm text-gray-600">Today's Check-ins</div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Positive Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>Track your emotional patterns to gain insights into your wellbeing and discover trends in your emotional journey.</p>
                      {records.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p><strong>Most Common Emotion:</strong> {
                            (() => {
                              const emotionCounts = records.reduce((acc, record) => {
                                acc[record.emotion] = (acc[record.emotion] || 0) + 1
                                return acc
                              }, {} as Record<string, number>)
                              const entries = Object.entries(emotionCounts)
                              return entries.sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
                            })()
                          }</p>
                          <p><strong>Total Records:</strong> {records.length}</p>
                          <p><strong>Days Tracked:</strong> {new Set(records.map(r => new Date(r.timestamp).toDateString())).size}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Wellness Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>Regular emotional check-ins can help you understand your patterns better. Consider setting aside time each day for self-reflection.</p>
                      <div className="mt-4 space-y-2">
                        <p>💡 <strong>Tip:</strong> Try to record your emotions at consistent times each day</p>
                        <p>🎯 <strong>Goal:</strong> Aim for at least one emotional check-in per day</p>
                        <p>📈 <strong>Progress:</strong> Look for patterns in your emotional journey</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
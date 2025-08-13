'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'


import { EmotionCalendar } from '@/components/EmotionCalendar'
import { EmotionChart } from '@/components/EmotionChart'
import { useEmotionStore } from '@/store/emotion'
import { subDays } from 'date-fns'
import { ArrowLeft, BarChart3, Calendar, Heart, RefreshCw, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  const records = useEmotionStore((state) => state.records)
  const [timeRange, setTimeRange] = useState<10 | 15 | 30>(30)

  // Filter records based on time range
  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.timestamp)
    const cutoffDate = subDays(new Date(), timeRange)
    return recordDate >= cutoffDate
  })



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-white/20 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent text-xl">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-500 text-xs">Insights into your emotional journey</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-gray-600 text-sm">
                  {records.length} records
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center">
            <h2 className="mb-2 font-bold text-2xl text-gray-900">Emotional Analytics</h2>
            <p className="text-gray-600">Track your emotional journey and behavioral patterns</p>
          </div>

          <div className="space-y-8">
            {/* Charts and Statistics Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Calendar Section - moved to left column */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Emotion Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmotionCalendar />
                </CardContent>
              </Card>
              {/* Emotion Distribution Chart - moved to right column */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Emotion Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmotionChart records={filteredRecords} />
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats - moved below as full width */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="font-bold text-3xl text-blue-600">{records.length}</div>
                    <div className="text-gray-600 text-sm">Total Records</div>
                  </div>
                  
                  {records.length > 0 && (
                    <>
                      <div className="text-center">
                        <div className="font-bold text-2xl text-green-600">
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
                        </div>
                        <div className="text-gray-600 text-sm">Average Impact Score (Recent 3)</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-2xl text-purple-600">
                          {records.filter(r => {
                            const today = new Date()
                            const recordDate = new Date(r.timestamp)
                            return recordDate.toDateString() === today.toDateString()
                          }).length}
                        </div>
                        <div className="text-gray-600 text-sm">Today's Check-ins</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>



            {/* Insights Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Emotional Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600 text-sm">
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
                    <Heart className="h-5 w-5 text-red-500" />
                    Wellness Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600 text-sm">
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
          </div>
        </div>
      </main>
    </div>
  )
}
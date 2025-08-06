'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { EmotionCalendar } from '@/components/EmotionCalendar'
import { EmotionChart } from '@/components/EmotionChart'
import { useEmotionStore } from '@/store/emotion'
import { ArrowLeft, Calendar, BarChart3, TrendingUp, Heart, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { subDays } from 'date-fns'

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
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-600">
                  {records.length} records
                </span>
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

          <div className="space-y-8">
            {/* Charts and Statistics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar Section - moved to left column */}
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
              {/* Emotion Distribution Chart - moved to right column */}
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
            </div>

            {/* Quick Stats - moved below as full width */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{records.length}</div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                  
                  {records.length > 0 && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
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
                        <div className="text-sm text-gray-600">Average Impact Score (Recent 3)</div>
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
                </div>
              </CardContent>
            </Card>



            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Emotional Patterns
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
          </div>
        </div>
      </main>
    </div>
  )
}
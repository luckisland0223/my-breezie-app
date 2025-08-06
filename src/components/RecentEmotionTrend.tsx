'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotion'
import { getEmotionEmoji, emotionConfig } from '@/config/emotionConfig'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { format, subDays, isToday, isYesterday } from 'date-fns'

export function RecentEmotionTrend() {
  const { records } = useEmotionStore()

  // Get last 7 days of records
  const sevenDaysAgo = subDays(new Date(), 7)
  const recentRecords = records
    .filter(record => new Date(record.timestamp) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (recentRecords.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Recent Emotions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent emotions recorded.</p>
            <p className="text-sm mt-2">Start tracking to see your trends!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group by date for better visualization
  const todayRecords = recentRecords.filter(record => isToday(new Date(record.timestamp)))
  const yesterdayRecords = recentRecords.filter(record => isYesterday(new Date(record.timestamp)))
  
  // Calculate average behavioral impact for trend (only chat records)
  const chatRecords = recentRecords.filter(record => record.recordType === 'chat')
  const avgImpact = chatRecords.length > 0 
    ? chatRecords.reduce((sum, record) => sum + record.behavioralImpact, 0) / chatRecords.length
    : 0

  const getTrendIcon = () => {
    if (avgImpact >= 6) return <TrendingUp className="w-4 h-4 text-red-500" />
    if (avgImpact <= 4) return <TrendingDown className="w-4 h-4 text-green-500" />
    return <div className="w-4 h-4 bg-yellow-500 rounded-full" />
  }

  const formatRelativeDate = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM dd')
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Recent Emotions
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant="secondary">
              Avg Impact: {avgImpact.toFixed(1)}/10
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's emotions */}
        {todayRecords.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Today</h4>
            <div className="flex flex-wrap gap-2">
              {todayRecords.slice(0, 4).map((record, index) => {
                const config = emotionConfig[record.emotion]
                return (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                    style={{ 
                      backgroundColor: config.bgColor,
                      color: config.color 
                    }}
                  >
                    <span>{config.emoji}</span>
                    <span className="text-xs">{record.emotion}</span>
                    <span className="text-xs opacity-75">
                      {format(new Date(record.timestamp), 'HH:mm')}
                    </span>
                  </Badge>
                )
              })}
              {todayRecords.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{todayRecords.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Yesterday's emotions */}
        {yesterdayRecords.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Yesterday</h4>
            <div className="flex flex-wrap gap-2">
              {yesterdayRecords.slice(0, 3).map((record, index) => {
                const config = emotionConfig[record.emotion]
                return (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 opacity-75"
                    style={{ 
                      backgroundColor: config.bgColor,
                      color: config.color 
                    }}
                  >
                    <span>{config.emoji}</span>
                    <span className="text-xs">{record.emotion}</span>
                  </Badge>
                )
              })}
              {yesterdayRecords.length > 3 && (
                <Badge variant="outline" className="text-xs opacity-75">
                  +{yesterdayRecords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Week summary */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Past 7 days</span>
            <span className="font-medium">{recentRecords.length} records</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
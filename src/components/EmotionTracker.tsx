import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useEmotionStore } from '@/store/emotionDatabase'
import type { EmotionType, EmotionRecord, PolarityType } from '@/store/emotion'
import { EmotionCalendar } from '@/components/EmotionCalendar'
import { EmotionChart } from '@/components/EmotionChart'
import { emotionConfig, getEmotionDisplay, getEmotionEmoji } from '@/config/emotionConfig'
import { toast } from 'sonner'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Minus,
  MessageCircle,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Trash2,
  Clock
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subDays, startOfDay, startOfWeek, endOfWeek, isSameMonth } from 'date-fns'

// Emotion display helper
const getEmotionDisplayInfo = (emotion: EmotionType) => {
  const config = emotionConfig[emotion]
  return {
    emoji: config.emoji,
    color: config.color,
    bgColor: config.bgColor,
    textColor: config.textColor,
    description: config.description
  }
}

type TimeRange = 10 | 15 | 30

export function EmotionTracker() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timeRange, setTimeRange] = useState<TimeRange>(30)
  const [selectedRecord, setSelectedRecord] = useState<EmotionRecord | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  
  // Store hooks
  const records = useEmotionStore((state) => state.records)
  const getEmotionStats = useEmotionStore((state) => state.getEmotionStats)
  const getRecentEmotions = useEmotionStore((state) => state.getRecentEmotions)
  const clearAllRecords = useEmotionStore((state) => state.clearAllRecords)
  const deleteRecord = useEmotionStore((state) => state.deleteRecord)

  // Helper function: get polarity display info
  const getPolarityDisplayInfo = (polarity: PolarityType) => {
    switch (polarity) {
      case 'positive':
        return {
          icon: TrendingUp,
          label: 'Positive Emotions',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          badgeVariant: 'default' as const
        }
      case 'negative':
        return {
          icon: TrendingDown,
          label: 'Negative Emotions',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          badgeVariant: 'destructive' as const
        }
      case 'neutral':
        return {
          icon: Minus,
          label: 'Neutral Emotions',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          badgeVariant: 'secondary' as const
        }
    }
  }

  // Helper function: get default polarity
  const getDefaultPolarity = (emotion: EmotionType): PolarityType => {
    const positiveEmotions: EmotionType[] = ['Joy', 'Love', 'Pride', 'Hope', 'Excitement', 'Gratitude', 'Contentment']
    const negativeEmotions: EmotionType[] = ['Anger', 'Sadness', 'Fear', 'Anxiety', 'Shame', 'Guilt', 'Envy', 'Loneliness', 'Frustration']
    
    if (positiveEmotions.includes(emotion)) return 'positive'
    if (negativeEmotions.includes(emotion)) return 'negative'
    return 'neutral'
  }

  // Get records from the selected time range
  const getFilteredRecords = () => {
    const endDate = new Date()
    const startDate = subDays(endDate, timeRange)
    return records.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startOfDay(startDate) && recordDate <= endDate
    })
  }

  const filteredRecords = getFilteredRecords()
  const stats = getEmotionStats()

  // Get today's records
  const todayRecords = records.filter(record => 
    isSameDay(new Date(record.timestamp), new Date())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Handle record deletion
  const handleDeleteRecord = (recordId: string) => {
    deleteRecord(recordId)
    toast.success('Emotion record deleted')
    setSelectedRecord(null)
    setIsDeleteConfirmOpen(false)
  }

  // Handle clear all records
  const handleClearAllRecords = () => {
    if (confirm('Are you sure you want to delete all emotion records? This action cannot be undone.')) {
      clearAllRecords()
      toast.success('All emotion records cleared')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Emotional Overview</h2>
        <p className="text-gray-600">Track your emotional journey and behavioral patterns</p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab - TOP PRIORITY */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {/* Quick Stats - moved to right column */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{records.length}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                
                {records.length > 0 && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-green-600">
                        {(() => {
                          console.log('📈 EmotionTracker - 开始计算 Avg Behavioral Impact Score (最近3条记录)...')
                          
                          // 按时间排序所有记录（最新的在前）
                          const sortedRecords = records
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          
                          console.log(`📊 总记录数: ${records.length}`)
                          
                          if (sortedRecords.length === 0) {
                            console.log('❌ 没有记录，返回 0')
                            return '0'
                          }
                          
                          // 取最近的3条记录
                          const recentRecords = sortedRecords.slice(0, 3)
                          console.log(`🔍 取最近的 ${recentRecords.length} 条记录进行计算`)
                          
                          // 展示每条记录的影响分数
                          console.log('📝 最近的记录影响分数：')
                          recentRecords.forEach((record, index) => {
                            console.log(`  ${index + 1}. [${record.emotion}] ${record.recordType}: ${record.behavioralImpact} (${new Date(record.timestamp).toLocaleString()})`)
                          })
                          
                          // 计算总和
                          const totalImpact = recentRecords.reduce((sum, r) => {
                            console.log(`  累加: ${sum} + ${r.behavioralImpact} = ${sum + r.behavioralImpact}`)
                            return sum + r.behavioralImpact
                          }, 0)
                          
                          // 计算平均值
                          const avgImpact = totalImpact / recentRecords.length
                          console.log(`🧮 EmotionTracker最近3条记录计算结果: ${totalImpact} ÷ ${recentRecords.length} = ${avgImpact}`)
                          console.log(`✅ EmotionTracker最终显示: ${avgImpact.toFixed(1)}`)
                          console.log('─'.repeat(50))
                          
                          return avgImpact.toFixed(1)
                        })()}
                      </div>
                      <div className="text-sm text-gray-600">Avg Behavioral Impact Score (最近3条)</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl mb-1">
                        📊 Analytics Available
                      </div>
                      <div className="text-sm text-gray-600">View detailed insights in Analytics tab</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
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
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {(() => {
                        console.log('📊 EmotionTracker Quick Statistics - 开始计算 Avg Behavioral Impact Score (最近3条记录)...')
                        
                        // 按时间排序所有记录（最新的在前）
                        const sortedRecords = records
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        
                        console.log(`📈 总记录数: ${records.length}`)
                        
                        if (sortedRecords.length === 0) {
                          console.log('❌ 没有记录，返回 0')
                          return '0'
                        }
                        
                        // 取最近的3条记录
                        const recentRecords = sortedRecords.slice(0, 3)
                        console.log(`🔍 Quick Statistics - 取最近的 ${recentRecords.length} 条记录进行计算`)
                        
                        // 展示每条记录的影响分数
                        console.log('📝 Quick Statistics - 最近的记录影响分数：')
                        recentRecords.forEach((record, index) => {
                          console.log(`  ${index + 1}. [${record.emotion}] ${record.recordType}: ${record.behavioralImpact} (${new Date(record.timestamp).toLocaleString()})`)
                        })
                        
                        // 计算总和
                        const totalImpact = recentRecords.reduce((sum, r) => {
                          console.log(`  累加: ${sum} + ${r.behavioralImpact} = ${sum + r.behavioralImpact}`)
                          return sum + r.behavioralImpact
                        }, 0)
                        
                        // 计算平均值
                        const avgImpact = totalImpact / recentRecords.length
                        console.log(`🧮 Quick Statistics最近3条记录计算结果: ${totalImpact} ÷ ${recentRecords.length} = ${avgImpact}`)
                        console.log(`✅ Quick Statistics最终显示: ${avgImpact.toFixed(1)}`)
                        console.log('─'.repeat(50))
                        
                        return avgImpact.toFixed(1)
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Avg Behavioral Impact Score (最近3条)</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Today's Emotions
                </CardTitle>
                <Badge variant="secondary">{todayRecords.length} records</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {todayRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No emotions recorded today yet.</p>
                  <p className="text-sm mt-2">Start a conversation to begin tracking!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayRecords.map((record) => {
                    const emotionInfo = getEmotionDisplayInfo(record.emotion)
                    return (
                      <div
                        key={record.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{emotionInfo.emoji}</span>
                            <div>
                              <div className="font-medium text-gray-900">{record.emotion}</div>
                              <div className="text-sm text-gray-600">
                                Behavioral Impact: {record.behavioralImpact}/10
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {format(new Date(record.timestamp), 'HH:mm')}
                            </div>
                            <Badge 
                              variant="secondary" 
                              style={{ 
                                backgroundColor: emotionInfo.bgColor,
                                color: emotionInfo.color 
                              }}
                            >
                              {getDefaultPolarity(record.emotion)}
                            </Badge>
                          </div>
                        </div>
                        {record.note && (
                          <div className="mt-2 text-sm text-gray-600 italic">
                            "{record.note}"
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record Detail Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{getEmotionEmoji(selectedRecord.emotion)}</span>
                Emotion Record Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Emotion</h4>
                <p className="text-gray-700">{getEmotionDisplay(selectedRecord.emotion)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Behavioral Impact Score</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-400 to-red-500" 
                      style={{ width: `${selectedRecord.behavioralImpact * 10}%` }}
                    />
                  </div>
                  <span className="font-medium">{selectedRecord.behavioralImpact}/10</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Time</h4>
                <p className="text-gray-700">
                  {format(new Date(selectedRecord.timestamp), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              {selectedRecord.note && (
                <div>
                  <h4 className="font-semibold text-gray-900">Notes</h4>
                  <p className="text-gray-700 italic">"{selectedRecord.note}"</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Record
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Emotion Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this emotion record? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedRecord && handleDeleteRecord(selectedRecord.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
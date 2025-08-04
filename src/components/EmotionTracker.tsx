import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useEmotionStore } from '@/store/emotionDatabase'
import type { EmotionType, EmotionRecord, PolarityType } from '@/store/emotion'
import { EmotionCalendar } from '@/components/EmotionCalendar'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Minus,
  MessageCircle,
  Heart,
  Smile,
  Frown,
  Angry,
  AlertTriangle,
  Meh,
  Zap,
  Brain,
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Trash2
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subDays, startOfDay, startOfWeek, endOfWeek, isSameMonth } from 'date-fns'

const emotionIcons = {
  'Anger': Angry,
  'Disgust': Meh,
  'Fear': AlertTriangle,
  'Joy': Smile,
  'Sadness': Frown,
  'Surprise': Zap,
  'Complex': Brain
}

const emotionColors = {
  'Anger': { bg: 'bg-red-500', color: '#fca5a5', light: 'bg-red-50' },
  'Disgust': { bg: 'bg-orange-500', color: '#fdba74', light: 'bg-orange-50' },
  'Fear': { bg: 'bg-purple-500', color: '#c4b5fd', light: 'bg-purple-50' },
  'Joy': { bg: 'bg-green-500', color: '#86efac', light: 'bg-green-50' },
  'Sadness': { bg: 'bg-blue-500', color: '#93c5fd', light: 'bg-blue-50' },
  'Surprise': { bg: 'bg-yellow-500', color: '#fde047', light: 'bg-yellow-50' },
  'Complex': { bg: 'bg-indigo-500', color: '#a5b4fc', light: 'bg-indigo-50' }
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
  const addEmotionRecord = useEmotionStore((state) => state.addEmotionRecord)
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
    switch (emotion) {
      case 'Joy':
        return 'positive'
      case 'Anger':
      case 'Fear':
      case 'Sadness':
      case 'Disgust':
        return 'negative'
      case 'Surprise':
      case 'Complex':
      default:
        return 'neutral'
    }
  }
    
  // Safety check
  if (!records || !getEmotionStats || !getRecentEmotions) {
    return <div className="p-6 text-center">Loading...</div>
  }
  
  // Get calendar data
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Get complete calendar grid
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  // Get data within time range
  const rangeData = getRecentEmotions(timeRange)
  const stats = getEmotionStats()

  // Get records for the day
  const getDayRecords = (day: Date): EmotionRecord[] => {
    return records.filter(record => 
      isSameDay(new Date(record.timestamp), day)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
  
  // Get primary emotion for each day
  const getDayEmotion = (day: Date): EmotionType | null => {
    const dayRecords = getDayRecords(day)
    if (dayRecords.length === 0) return null
    
    const lastRecord = dayRecords[0]
    if (!lastRecord) return null
    
    return lastRecord.emotionEvaluation?.actualEmotion || lastRecord.emotion
  }
  
  // Handle record deletion
  const handleDeleteRecord = (recordId: string) => {
    deleteRecord(recordId)
    setSelectedRecord(null)
    setIsDeleteConfirmOpen(false)
    toast.success('Record deleted successfully')
  }
  
  // Test function: add multiple detailed emotion records
  const addTestRecords = () => {
    const detailedRecords = [
      {
        emotion: 'Joy' as EmotionType,
        behavioralImpact: 8,
        description: 'Joy from reuniting with friends, through deep emotional sharing, gaining valuable guidance and advice. In-depth exchange, 4 rounds of conversation'
      },
      {
        emotion: 'Sadness' as EmotionType,
        behavioralImpact: 6,
        description: 'Nostalgia for better times in the past, through initial emotional expression, completing basic emotional processing. Moderate exchange, 3 rounds of conversation'
      },
      {
        emotion: 'Anger' as EmotionType,
        behavioralImpact: 5,
        description: 'Emotional fluctuations due to work stress, through deep self-exploration and reflection, gaining valuable guidance and advice. In-depth exchange, 5 rounds of conversation'
      }
    ]
    
    detailedRecords.forEach((record, index) => {
      setTimeout(() => {
        addEmotionRecord(record.emotion, record.behavioralImpact, record.description)
      }, index * 100)
    })
  }
  
  // Calculate pie chart data
  const getPieData = () => {
    const emotionCounts: { [key: string]: number } = {}
    rangeData.forEach(record => {
      const emotion = record.emotionEvaluation?.actualEmotion || record.emotion
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: emotionColors[emotion as EmotionType]?.color || '#6b7280'
    }))
  }
  
  const pieData = getPieData()
  const totalRecords = records.length
  
  // Calculate most frequent emotion
  const getMostFrequentEmotion = (): { emotion: EmotionType; count: number } => {
    if (pieData.length === 0) return { emotion: 'Joy', count: 0 }
    const maxItem = pieData.reduce((a, b) => a.value > b.value ? a : b)
    return { emotion: maxItem.name as EmotionType, count: maxItem.value }
  }
  
  const mostFrequent = getMostFrequentEmotion()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emotion Analytics Dashboard</h1>
            <p className="text-gray-600">Gain deep insights into your emotional patterns and trends</p>
          </div>
        </div>

        {/* Navigation Bar Layout */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Records
            </TabsTrigger>
          </TabsList>

          {/* Overview Page */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Frequent Emotion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={emotionColors[mostFrequent.emotion]?.light}
                      style={{ color: emotionColors[mostFrequent.emotion]?.color }}
                    >
                      {mostFrequent.emotion}
                    </Badge>
                    <span className="text-2xl font-bold">{mostFrequent.count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Most common in last {timeRange} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRecords}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cumulative emotion logs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rangeData.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Records in last {timeRange} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Behavioral Impact</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rangeData.length > 0 
                      ? (rangeData.reduce((sum, record) => sum + (record.behavioralImpact), 0) / rangeData.length).toFixed(1)
                      : '0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Average emotional impact on behavior (1-10)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ⭐ Emotion Calendar - Featured Section */}
            <div className="relative">
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                  ⭐ Featured
                </div>
              </div>
              <div className="ring-2 ring-yellow-300 ring-opacity-50 rounded-lg shadow-lg">
                <EmotionCalendar />
              </div>
            </div>
          </TabsContent>

          {/* Analysis Page */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Emotion Distribution Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Emotion Distribution Analysis
                </CardTitle>
                <div className="flex gap-2">
                  {[10, 15, 30].map((days) => (
                    <Button
                      key={days}
                      variant={timeRange === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(days as TimeRange)}
                    >
                      {days} days
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Detailed Analysis */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Emotion Analysis Report</h3>
                      <div className="space-y-3">
                        {pieData.map((item) => {
                          const percentage = (item.value / rangeData.length * 100).toFixed(1)
                          const IconComponent = emotionIcons[item.name as EmotionType]
                          return (
                            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <IconComponent className="w-5 h-5" style={{ color: item.color }} />
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{item.value} times</div>
                                <div className="text-sm text-gray-500">{percentage}%</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Analysis insights */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-800 mb-2">💡 Analysis Insights</h4>
                        <p className="text-sm text-blue-700">
                          {mostFrequent.emotion === 'Joy' ? 
                            `Excellent! You've maintained a positive emotional state over the last ${timeRange} days, with ${mostFrequent.emotion} appearing ${mostFrequent.count} times. Keep up this wonderful mindset!` :
                            mostFrequent.emotion === 'Sadness' || mostFrequent.emotion === 'Anger' ? 
                            `Over the last ${timeRange} days, your ${mostFrequent.emotion.toLowerCase()} emotion appeared ${mostFrequent.count} times. Consider relaxation activities, seeking support, and prioritizing your mental health.` :
                            `Your primary emotion is ${mostFrequent.emotion.toLowerCase()}, appearing ${mostFrequent.count} times. Consider maintaining emotion records, observing patterns, and seeking professional help when needed.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No emotion records in the last {timeRange} days</p>
                      <p className="text-sm mt-2">Start tracking your emotions to analyze your emotional patterns</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Page */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Emotion Record Details
                </CardTitle>
                <p className="text-sm text-gray-600">Click on records to view detailed analysis</p>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No emotion records yet</p>
                    <p className="text-sm">Start your first emotion conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[700px] overflow-y-auto">
                    {records
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((record) => {
                        const IconComponent = emotionIcons[record.emotion]
                        const actualEmotion = record.emotionEvaluation?.actualEmotion || record.emotion
                        const actualIconComponent = emotionIcons[actualEmotion]
                        
                        return (
                          <div 
                            key={record.id} 
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="flex flex-col items-center space-y-1">
                                  <IconComponent className="w-6 h-6 text-gray-600" />
                                  {record.emotionEvaluation?.emotionChanged && (
                                    <div className="text-xs text-gray-400">→</div>
                                  )}
                                  {record.emotionEvaluation?.emotionChanged && (
                                    React.createElement(actualIconComponent, { 
                                      className: "w-5 h-5", 
                                      style: { color: emotionColors[actualEmotion]?.color } 
                                    })
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium">{record.emotion}</h3>
                                    
                                    {/* Emotion Polarity Display */}
                                    {(() => {
                                      const polarity = record.polarityAnalysis?.polarity || getDefaultPolarity(record.emotion)
                                      const polarityInfo = getPolarityDisplayInfo(polarity)
                                      const PolarityIcon = polarityInfo.icon
                                      
                                      return (
                                        <Badge variant={polarityInfo.badgeVariant} className="text-xs flex items-center gap-1">
                                          <PolarityIcon className="w-3 h-3" />
                                          {polarityInfo.label}
                                        </Badge>
                                      )
                                    })()}
                                    
                                    <Badge variant="outline" className="text-xs">
                                      Behavioral Impact {record.behavioralImpact}/10
                                    </Badge>
                                    {record.emotionEvaluation?.emotionChanged && (
                                      <Badge variant="secondary" className="text-xs">
                                        AI Detected: {actualEmotion}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mb-2">
                                    {format(new Date(record.timestamp), 'MMM dd, HH:mm')}
                                  </p>
                                  
                                  <p className="text-sm text-gray-500 truncate">
                                    {record.note}
                                  </p>
                                </div>
                              </div>
                              
                              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        {selectedRecord && (
          <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(emotionIcons[selectedRecord.emotion], { className: "w-5 h-5" })}
                  Emotion Record Details - {selectedRecord.emotion}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  {format(new Date(selectedRecord.timestamp), 'MMM dd, yyyy HH:mm')}
                </div>
                
                <div className="py-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedRecord.note}</p>
                  </div>
                </div>
                
                {/* Button Area */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Record
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRecord(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Delete Confirmation Dialog */}
        {isDeleteConfirmOpen && selectedRecord && (
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Confirm Delete Record
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Warning:</strong> This action cannot be undone!
                  </p>
                  <p className="text-sm text-red-700">
                    Are you sure you want to delete this emotion record? This action cannot be undone.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(emotionIcons[selectedRecord.emotion], { 
                      className: "w-4 h-4",
                      style: { color: emotionColors[selectedRecord.emotion]?.color }
                    })}
                    <span className="font-medium">{selectedRecord.emotion}</span>
                    <span className="text-sm text-gray-500">
                      · {format(new Date(selectedRecord.timestamp), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {selectedRecord.note}
                  </p>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteRecord(selectedRecord.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
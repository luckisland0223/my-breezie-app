import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType, EmotionRecord, PolarityType } from '@/store/emotion'
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
import { zhCN } from 'date-fns/locale'

const emotionIcons = {
  '愤怒': Angry,
  '厌恶': Meh,
  '恐惧': AlertTriangle,
  '快乐': Smile,
  '悲伤': Frown,
  '惊讶': Zap,
  '复杂': Brain
}

const emotionColors = {
  '愤怒': { bg: 'bg-red-500', color: '#ef4444', light: 'bg-red-50' },
  '厌恶': { bg: 'bg-orange-500', color: '#f97316', light: 'bg-orange-50' },
  '恐惧': { bg: 'bg-purple-500', color: '#a855f7', light: 'bg-purple-50' },
  '快乐': { bg: 'bg-green-500', color: '#22c55e', light: 'bg-green-50' },
  '悲伤': { bg: 'bg-blue-500', color: '#3b82f6', light: 'bg-blue-50' },
  '惊讶': { bg: 'bg-yellow-500', color: '#eab308', light: 'bg-yellow-50' },
  '复杂': { bg: 'bg-indigo-500', color: '#6366f1', light: 'bg-indigo-50' }
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

  // 辅助函数：获取极性显示信息
  const getPolarityDisplayInfo = (polarity: PolarityType) => {
    switch (polarity) {
      case 'positive':
        return {
          icon: TrendingUp,
          label: '积极情绪',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          badgeVariant: 'default' as const
        }
      case 'negative':
        return {
          icon: TrendingDown,
          label: '消极情绪',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          badgeVariant: 'destructive' as const
        }
      case 'neutral':
        return {
          icon: Minus,
          label: '中性情绪',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          badgeVariant: 'secondary' as const
        }
    }
  }

  // 辅助函数：获取默认极性
  const getDefaultPolarity = (emotion: EmotionType): PolarityType => {
    switch (emotion) {
      case '快乐':
        return 'positive'
      case '愤怒':
      case '恐惧':
      case '悲伤':
      case '厌恶':
        return 'negative'
      case '惊讶':
      case '复杂':
      default:
        return 'neutral'
    }
  }
    
  // 安全检查
  if (!records || !getEmotionStats || !getRecentEmotions) {
    return <div className="p-6 text-center">加载中...</div>
  }
  
  // 获取日历数据
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // 获取完整的日历网格
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  // 获取时间范围内的数据
  const rangeData = getRecentEmotions(timeRange)
  const stats = getEmotionStats()

  // 获取当天的记录
  const getDayRecords = (day: Date): EmotionRecord[] => {
    return records.filter(record => 
      isSameDay(new Date(record.timestamp), day)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
  
  // 获取每日的主要情绪
  const getDayEmotion = (day: Date): EmotionType | null => {
    const dayRecords = getDayRecords(day)
    if (dayRecords.length === 0) return null
    
    const lastRecord = dayRecords[0]
    if (!lastRecord) return null
    
    return lastRecord.emotionEvaluation?.actualEmotion || lastRecord.emotion
  }
  
  // 处理删除记录
  const handleDeleteRecord = (recordId: string) => {
    deleteRecord(recordId)
    setSelectedRecord(null)
    setIsDeleteConfirmOpen(false)
    toast.success('记录已删除')
  }
  
  // 测试函数：添加多个详细的情绪记录
  const addTestRecords = () => {
    const detailedRecords = [
      {
        emotion: '快乐' as EmotionType,
        intensity: 8,
        description: '与朋友重聚后的喜悦，通过深入的情感分享，获得了有价值的指导和建议。深度交流，共4轮对话'
      },
      {
        emotion: '悲伤' as EmotionType,
        intensity: 6,
        description: '对过去美好时光的怀念，通过初步的情感表达，完成了基本的情感梳理。适度交流，共3轮对话'
      },
      {
        emotion: '愤怒' as EmotionType,
        intensity: 5,
        description: '工作压力导致的情绪波动，通过深入的自我探索和反思，获得了有价值的指导和建议。深度交流，共5轮对话'
      }
    ]
    
    detailedRecords.forEach((record, index) => {
      setTimeout(() => {
        addEmotionRecord(record.emotion, record.intensity, record.description)
      }, index * 100)
    })
  }
  
  // 计算饼图数据
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
  
  // 计算最多情绪
  const getMostFrequentEmotion = (): { emotion: EmotionType; count: number } => {
    if (pieData.length === 0) return { emotion: '快乐', count: 0 }
    const maxItem = pieData.reduce((a, b) => a.value > b.value ? a : b)
    return { emotion: maxItem.name as EmotionType, count: maxItem.value }
  }
  
  const mostFrequent = getMostFrequentEmotion()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">情绪统计分析</h1>
            <p className="text-gray-600">深入了解你的情绪模式和变化趋势</p>
          </div>
        </div>

        {/* Navigation Bar 布局 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              分析
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              记录
            </TabsTrigger>
          </TabsList>

          {/* 概览页面 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 统计方框 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">最多情绪</CardTitle>
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
                    最近{timeRange}天出现最多
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">情绪总计</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRecords}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    累计记录数量
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">最近活跃</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rangeData.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    最近{timeRange}天记录
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均强度</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rangeData.length > 0 
                      ? (rangeData.reduce((sum, record) => sum + (record.emotionEvaluation?.actualIntensity || record.intensity), 0) / rangeData.length).toFixed(1)
                      : '0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    情绪强度平均值
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 分析页面 */}
          <TabsContent value="analysis" className="space-y-6">
            {/* 情绪分布饼图 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  情绪分布分析
                </CardTitle>
                <div className="flex gap-2">
                  {[10, 15, 30].map((days) => (
                    <Button
                      key={days}
                      variant={timeRange === days ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(days as TimeRange)}
                    >
                      {days}天
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
                    
                    {/* 详细分析 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">情绪分析报告</h3>
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
                                <div className="text-lg font-bold">{item.value}次</div>
                                <div className="text-sm text-gray-500">{percentage}%</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* 分析建议 */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-800 mb-2">💡 分析洞察</h4>
                        <p className="text-sm text-blue-700">
                          {mostFrequent.emotion === '快乐' ? 
                            `太棒了！你在最近${timeRange}天中保持了积极的情绪状态，${mostFrequent.emotion}出现了${mostFrequent.count}次。继续保持这种良好的心态！` :
                            mostFrequent.emotion === '悲伤' || mostFrequent.emotion === '愤怒' ? 
                            `在最近${timeRange}天中，你的${mostFrequent.emotion}情绪出现了${mostFrequent.count}次。建议适当放松，寻求支持，关注自己的心理健康。` :
                            `你的主要情绪是${mostFrequent.emotion}，出现了${mostFrequent.count}次。建议保持情绪记录，观察模式，必要时寻求专业帮助。`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>最近{timeRange}天暂无情绪记录</p>
                      <p className="text-sm mt-2">开始记录你的情绪，让我们为你分析情绪模式</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 记录页面 */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  情绪记录详情
                </CardTitle>
                <p className="text-sm text-gray-600">点击记录查看详细分析</p>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>还没有情绪记录</p>
                    <p className="text-sm">开始你的第一次情绪对话吧！</p>
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
                                    
                                    {/* 情绪极性显示 */}
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
                                      对话效果 {record.intensity}/10
                                    </Badge>
                                    {record.emotionEvaluation?.emotionChanged && (
                                      <Badge variant="secondary" className="text-xs">
                                        AI识别: {actualEmotion}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mb-2">
                                    {format(new Date(record.timestamp), 'MM月dd日 HH:mm', { locale: zhCN })}
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

        {/* 详情对话框 */}
        {selectedRecord && (
          <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(emotionIcons[selectedRecord.emotion], { className: "w-5 h-5" })}
                  情绪记录详情 - {selectedRecord.emotion}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  {format(new Date(selectedRecord.timestamp), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </div>
                
                <div className="py-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedRecord.note}</p>
                  </div>
                </div>
                
                {/* 按钮区域 */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除记录
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRecord(null)}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* 删除确认对话框 */}
        {isDeleteConfirmOpen && selectedRecord && (
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  确认删除记录
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>警告：</strong> 此操作不可撤销！
                  </p>
                  <p className="text-sm text-red-700">
                    你确定要删除这条情绪记录吗？删除后将无法恢复。
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
                      · {format(new Date(selectedRecord.timestamp), 'MM月dd日 HH:mm', { locale: zhCN })}
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
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteRecord(selectedRecord.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    确认删除
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
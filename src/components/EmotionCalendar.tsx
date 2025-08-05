'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmotionStore } from '@/store/emotionDatabase'
import type { EmotionType, EmotionRecord } from '@/store/emotion'
import { emotionConfig, getEmotionEmoji, getEmotionDisplay } from '@/config/emotionConfig'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay, subMonths, addMonths } from 'date-fns'

interface DayEmotions {
  date: Date
  emotions: EmotionRecord[]
  primaryEmotion: EmotionType
}

export function EmotionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<DayEmotions | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const getCurrentUserRecords = useEmotionStore((state) => state.getCurrentUserRecords)
  const records = getCurrentUserRecords()
  const deleteRecord = useEmotionStore((state) => state.deleteRecord)
  
  // Group emotions by day
  const dailyEmotions = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })
    
    const dayEmotionsArray: DayEmotions[] = []
    
    days.forEach(date => {
      const dayRecords = records.filter(record => 
        isSameDay(new Date(record.timestamp), date)
      )
      
      let primaryEmotion: EmotionType = 'Joy' // Default
      
      if (dayRecords.length > 0) {
        // Find most frequent emotion for the day
        const emotionCount: Record<string, number> = {}
        dayRecords.forEach(record => {
          emotionCount[record.emotion] = (emotionCount[record.emotion] || 0) + 1
        })
        
        const mostFrequent = Object.entries(emotionCount)
          .filter(([_, count]) => count === Math.max(...Object.values(emotionCount)))
          .map(([emotion]) => emotion as EmotionType)
        
        if (mostFrequent.length === 1 && mostFrequent[0]) {
          primaryEmotion = mostFrequent[0]
        } else {
          // If tie, use most recent
          const sortedRecords = dayRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          primaryEmotion = sortedRecords[0]?.emotion || 'Joy'
        }
      }
      
      dayEmotionsArray.push({
        date,
        emotions: dayRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        primaryEmotion
      })
    })
    
    return dayEmotionsArray
  }, [records, currentDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const handleDayClick = (dayData: DayEmotions) => {
    if (dayData.emotions.length > 0) {
      setSelectedDay(dayData)
      setIsDialogOpen(true)
    }
  }

  const handleDeleteRecord = (recordId: string) => {
    deleteRecord(recordId)
    toast.success('Emotion record deleted')
    
    // Update selected day data
    if (selectedDay) {
      const updatedEmotions = selectedDay.emotions.filter(e => e.id !== recordId)
      if (updatedEmotions.length === 0) {
        setSelectedDay(null)
        setIsDialogOpen(false)
      } else {
        setSelectedDay({
          ...selectedDay,
          emotions: updatedEmotions
        })
      }
    }
  }

  const getDayOfWeek = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[getDay(date)]
  }

  const getEmotionIntensityColor = (emotion: EmotionType, intensity: number) => {
    const baseColor = emotionConfig[emotion]?.color || '#6B7280'
    const opacity = Math.max(0.3, intensity / 10) // Minimum 30% opacity
    return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-2xl mx-auto">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {dailyEmotions.map((dayData, index) => {
            const isCurrentMonth = dayData.date.getMonth() === currentDate.getMonth()
            const isTodayDate = isToday(dayData.date)
            const hasEmotions = dayData.emotions.length > 0
            
            return (
              <div
                key={index}
                className={`
                  aspect-square p-1 cursor-pointer transition-all duration-200 min-h-[60px] rounded-2xl border-2
                  ${isCurrentMonth 
                    ? hasEmotions 
                      ? 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-lg hover:border-gray-300' 
                      : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                    : 'bg-gray-50 text-gray-400 border-gray-100'}
                  ${isTodayDate ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  ${hasEmotions ? 'shadow-sm' : ''}
                `}
                onClick={() => handleDayClick(dayData)}
              >
                <div className="h-full flex flex-col">
                  {/* Date */}
                  <div className={`text-xs font-medium mb-0.5 ${isTodayDate ? 'text-blue-600' : ''}`}>
                    {dayData.date.getDate()}
                  </div>
                  
                  {/* Emotions */}
                  {hasEmotions && (
                    <div className="flex-1 flex flex-col justify-center items-center">
                      <div className="text-sm mb-0.5">
                        {getEmotionEmoji(dayData.primaryEmotion)}
                      </div>
                      <div className="text-[10px] text-gray-600 leading-tight text-center">
                        {dayData.emotions.length} record{dayData.emotions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="text-center text-sm text-gray-500">
        Click on any day with emotions to view details • Today is highlighted in blue
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDay && format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {selectedDay.emotions.length} emotion record{selectedDay.emotions.length !== 1 ? 's' : ''} on this day
              </div>
              
              <div className="space-y-3">
                {selectedDay.emotions.map((record, index) => {
                  const emotionInfo = emotionConfig[record.emotion]
                  return (
                    <div
                      key={record.id}
                      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{emotionInfo.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{record.emotion}</span>
                              <Badge 
                                variant="secondary"
                                style={{ 
                                  backgroundColor: emotionInfo.bgColor,
                                  color: emotionInfo.color 
                                }}
                              >
                                Impact: {record.behavioralImpact}/10
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(record.timestamp), 'h:mm a')}
                            </div>
                            {record.note && (
                              <div className="text-sm text-gray-700 italic mt-2">
                                "{record.note}"
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
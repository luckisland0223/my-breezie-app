'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { emotionConfig, getEmotionDisplay, getEmotionEmoji } from '@/config/emotionConfig'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionRecord, EmotionType } from '@/store/emotion'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isToday, startOfMonth, subMonths } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface DayEmotions {
  date: Date
  emotions: EmotionRecord[]
  primaryEmotion: EmotionType
}

export function EmotionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<DayEmotions | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const allRecords = useEmotionStore((state) => state.records)
  // Filter records for current user
  const records = useMemo(() => {
    try {
      const savedUser = localStorage.getItem('breezie_current_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        return allRecords.filter((record) => record.user_id === user.id)
      }
    } catch (error) {
      // Ignore error
    }
    return allRecords
  }, [allRecords])
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
        // Use the most recent (last) emotion for the day
        const sortedRecords = dayRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        primaryEmotion = sortedRecords[0]?.emotion || 'Joy'
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
        <h3 className="font-semibold text-gray-900 text-lg">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mx-auto max-w-2xl">
        {/* Weekday Headers */}
        <div className="mb-3 grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 text-xs">
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
              <button
                type="button"
                key={index}
                className={`relative aspect-square min-h-[60px] rounded-2xl border-2 p-1 transition-all duration-200 ${isCurrentMonth 
                    ? hasEmotions 
                      ? "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg" 
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    : "border-gray-100 bg-gray-50 text-gray-400"}
                  ${isTodayDate ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  ${hasEmotions ? 'shadow-sm' : ''}
                `}
                onClick={() => handleDayClick(dayData)}
                aria-label={`${format(dayData.date, 'EEEE, MMMM d, yyyy')} - ${hasEmotions ? `${dayData.emotions.length} emotion record${dayData.emotions.length !== 1 ? 's' : ''}` : 'No emotions recorded'}`}
              >
                <div className="flex h-full flex-col">
                  {/* Date */}
                  <div className={`mb-0.5 font-medium text-xs ${isTodayDate ? 'text-blue-600' : ''}`}>
                    {dayData.date.getDate()}
                  </div>
                  
                  {/* Emotions */}
                  {hasEmotions && (
                    <div className="flex flex-1 flex-col items-center justify-center">
                      <div className="text-2xl">
                        {getEmotionEmoji(dayData.primaryEmotion)}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Multiple records indicator dot - positioned in lower right corner of the entire cell */}
                {hasEmotions && dayData.emotions.length > 1 && (
                  <div className="absolute right-1 bottom-1 h-2 w-2 rounded-full border border-white bg-blue-500 shadow-sm" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="text-center text-gray-500 text-sm">
        Click on any day with emotions to view details • Today is highlighted in blue
      </div>

      {/* Day Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDay && format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              <div className="text-gray-600 text-sm">
                {selectedDay.emotions.length} emotion record{selectedDay.emotions.length !== 1 ? 's' : ''} on this day
              </div>
              
              <div className="space-y-3">
                {selectedDay.emotions.map((record, index) => {
                  const emotionInfo = emotionConfig[record.emotion]
                  return (
                    <div
                      key={record.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-1 items-center gap-3">
                          <span className="text-2xl">{emotionInfo.emoji}</span>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
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
                            <div className="text-gray-600 text-sm">
                              {format(new Date(record.timestamp), 'h:mm a')}
                            </div>
                            {/* Display different content based on record type */}
                            {record.recordType === 'quick_check' ? (
                              // For quick checks, show the note as before
                              record.note && (
                                <div className="mt-2 text-gray-700 text-sm italic">
                                  "{record.note}"
                                </div>
                              )
                            ) : (
                              // For conversation records, show the conversation summary
                              record.conversationSummary && (
                                <div className="mt-2 text-gray-700 text-sm">
                                  <div className="mb-1 font-medium text-gray-800">Conversation Summary:</div>
                                  <div className="italic">"{record.conversationSummary}"</div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
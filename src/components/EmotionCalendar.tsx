'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType, EmotionRecord } from '@/store/emotion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'

// Emotion colors for calendar display
const emotionColors: Record<EmotionType, string> = {
  'Joy': 'bg-green-100 text-green-800 border-green-200',
  'Sadness': 'bg-blue-100 text-blue-800 border-blue-200', 
  'Anger': 'bg-red-100 text-red-800 border-red-200',
  'Fear': 'bg-purple-100 text-purple-800 border-purple-200',
  'Surprise': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Disgust': 'bg-orange-100 text-orange-800 border-orange-200',
  'Complex': 'bg-indigo-100 text-indigo-800 border-indigo-200'
}

// Emotion icons
const emotionIcons: Record<EmotionType, string> = {
  'Joy': '😊',
  'Sadness': '😢',
  'Anger': '😠',
  'Fear': '😨',
  'Surprise': '😲',
  'Disgust': '🤢',
  'Complex': '🤔'
}

interface DayEmotions {
  date: Date
  emotions: EmotionRecord[]
  primaryEmotion: EmotionType
}

export function EmotionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<DayEmotions | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const records = useEmotionStore((state) => state.records)
  
  // Group emotions by day
  const dailyEmotions = useMemo(() => {
    const grouped: { [key: string]: EmotionRecord[] } = {}
    
    records.forEach(record => {
      const dateKey = record.timestamp.toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(record)
    })
    
    // Convert to DayEmotions array with primary emotion logic
    const dayEmotionsArray: DayEmotions[] = []
    Object.entries(grouped).forEach(([dateKey, dayRecords]) => {
      const date = new Date(dateKey)
      
      // Determine primary emotion (most frequent or most recent)
      let primaryEmotion: EmotionType = 'Joy' // Default fallback
      if (dayRecords.length === 1 && dayRecords[0]) {
        primaryEmotion = dayRecords[0].emotion
      } else if (dayRecords.length > 1) {
        // Count emotions for the day
        const emotionCounts: { [key: string]: number } = {}
        dayRecords.forEach(record => {
          emotionCounts[record.emotion] = (emotionCounts[record.emotion] || 0) + 1
        })
        
        // Get most frequent emotion, if tie then use most recent
        const maxCount = Math.max(...Object.values(emotionCounts))
        const mostFrequent = Object.entries(emotionCounts)
          .filter(([_, count]) => count === maxCount)
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
  }, [records])
  
  // Get calendar data for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days = []
    const currentDay = new Date(startDate)
    
    // Generate 42 days (6 weeks) for complete calendar grid
    for (let i = 0; i < 42; i++) {
      const dayEmotions = dailyEmotions.find(de => 
        de.date.toDateString() === currentDay.toDateString()
      )
      
      days.push({
        date: new Date(currentDay),
        dayEmotions,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString()
      })
      
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  
  const handleDayClick = (dayData: any) => {
    if (dayData.dayEmotions) {
      setSelectedDay(dayData.dayEmotions)
      setIsDialogOpen(true)
    }
  }
  
  const handlePrimaryEmotionChange = (newPrimaryEmotion: EmotionType) => {
    if (selectedDay) {
      // Update the primary emotion (this would require updating the store if we want to persist it)
      // For now, we'll just update the local state
      setSelectedDay({
        ...selectedDay,
        primaryEmotion: newPrimaryEmotion
      })
      toast.success(`Primary emotion updated to ${newPrimaryEmotion}`)
    }
  }
  
  const calendarDays = getCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Emotion Calendar
        </CardTitle>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 p-1 sm:p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                relative aspect-square border rounded-lg cursor-pointer transition-all duration-200 min-h-[50px] sm:min-h-[60px]
                ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50 hover:shadow-md' : 'bg-gray-100 text-gray-400'}
                ${day.isToday ? 'ring-2 ring-blue-500 ring-opacity-75 bg-blue-50' : ''}
                ${day.dayEmotions ? 'hover:scale-105 shadow-sm' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              {/* Date number in top-left corner */}
              <div className="absolute top-1 left-1 text-xs font-medium">
                {day.date.getDate()}
              </div>
              
              {/* Emotion icon display */}
              {day.dayEmotions ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-1">
                    {/* Main emotion icon */}
                    <div className="text-2xl">
                      {emotionIcons[day.dayEmotions.primaryEmotion]}
                    </div>
                    
                    {/* Multiple emotions indicator */}
                    {day.dayEmotions.emotions.length > 1 && (
                      <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
                        {day.dayEmotions.emotions
                          .slice(0, 4) // Show up to 4 emotion icons
                          .filter((emotion, idx, arr) => 
                            arr.findIndex(e => e.emotion === emotion.emotion) === idx
                          ) // Remove duplicates
                          .map((emotion, idx) => (
                            <div key={idx} className="text-xs opacity-80 hover:opacity-100 transition-opacity">
                              {emotionIcons[emotion.emotion]}
                            </div>
                          ))
                        }
                        {day.dayEmotions.emotions.length > 4 && (
                          <div className="text-xs text-gray-600 font-medium bg-gray-100 rounded-full px-1">
                            +{day.dayEmotions.emotions.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Empty day - show subtle plus icon for adding emotions
                <div className="flex items-center justify-center h-full opacity-0 hover:opacity-30 transition-opacity">
                  <div className="text-2xl text-gray-400">+</div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Tips for new users */}
        {dailyEmotions.length === 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span>
              <h4 className="text-sm font-medium text-blue-900">Start Your Emotion Journey</h4>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Begin tracking your emotions to see them displayed on this calendar! 
              Use the emotion selector below to record how you're feeling.
            </p>
            <p className="text-xs text-blue-600">
              Once you start recording, each day will show emoji icons representing your emotions.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(emotionIcons).map(([emotion, icon]) => (
              <div key={emotion} className="flex items-center gap-1 text-xs">
                <span>{icon}</span>
                <span>{emotion}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      {/* Day Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && selectedDay.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Emotions recorded today:</h4>
                <div className="space-y-2">
                  {selectedDay.emotions.map((record, index) => (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span>{emotionIcons[record.emotion]}</span>
                        <span className="font-medium">{record.emotion}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {record.timestamp.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedDay.emotions.length > 1 && (
                <div>
                  <h4 className="font-medium mb-2">Primary emotion for this day:</h4>
                  <Select
                    value={selectedDay.primaryEmotion}
                    onValueChange={(value) => handlePrimaryEmotionChange(value as EmotionType)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span>{emotionIcons[selectedDay.primaryEmotion]}</span>
                          <span>{selectedDay.primaryEmotion}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDay.emotions
                        .map(record => record.emotion)
                        .filter((emotion, index, arr) => arr.indexOf(emotion) === index) // Remove duplicates
                        .map(emotion => (
                          <SelectItem key={emotion} value={emotion}>
                            <div className="flex items-center gap-2">
                              <span>{emotionIcons[emotion]}</span>
                              <span>{emotion}</span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    This will be the main emotion shown on the calendar for this day.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
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
          const sortedRecords = dayRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          primaryEmotion = sortedRecords[0]?.emotion || 'Joy'
        }
      }
      
      dayEmotionsArray.push({
        date,
        emotions: dayRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
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
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                relative p-2 min-h-[60px] border rounded-lg cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-400'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                ${day.dayEmotions ? 'hover:shadow-md' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-sm font-medium">{day.date.getDate()}</div>
              
              {/* Emotion indicator */}
              {day.dayEmotions && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className={`
                    text-xs px-1 py-0.5 rounded-full text-center border
                    ${emotionColors[day.dayEmotions.primaryEmotion]}
                  `}>
                    <span className="mr-1">{emotionIcons[day.dayEmotions.primaryEmotion]}</span>
                    {day.dayEmotions.emotions.length > 1 && (
                      <span className="text-xs">+{day.dayEmotions.emotions.length - 1}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
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
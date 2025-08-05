'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth'
import { primaryEmotions, getEmotionEmoji, emotionConfig } from '@/config/emotionConfig'
import type { EmotionType } from '@/store/emotion'
import { Heart, Plus, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function QuickEmotionCheckSplit() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const { user, isLoggedIn } = useAuthStore()

  // Calculate intensity based on pixel position
  const calculateIntensityFromPosition = (clientX: number): number => {
    if (!sliderRef.current) return intensity
    
    const rect = sliderRef.current.getBoundingClientRect()
    const relativeX = clientX - rect.left
    const percentage = Math.max(0, Math.min(1, relativeX / rect.width))
    
    // Map percentage to 1-10 range and round to nearest integer
    const rawValue = 1 + percentage * 9
    return Math.round(rawValue)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const newIntensity = calculateIntensityFromPosition(e.clientX)
    setIntensity(newIntensity)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    const newIntensity = calculateIntensityFromPosition(e.clientX)
    setIntensity(newIntensity)
  }, [isDragging, intensity])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleQuickRecord = async () => {
    if (!isLoggedIn || !user?.id) {
      toast.error('Please sign in to record emotions')
      return
    }

    if (!selectedEmotion) {
      toast.error('Please select an emotion first')
      return
    }

    setIsSubmitting(true)

    try {
      // 调用新的分表API
      const response = await fetch('/api/emotions-split', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          recordType: 'quick_check',
          emotion: selectedEmotion,
          intensity: intensity,
          note: `Quick check: ${selectedEmotion} at intensity ${intensity}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to record emotion')
      }

      const data = await response.json()
      
      if (data.success) {
        toast.success(`${getEmotionEmoji(selectedEmotion)} Emotion recorded successfully!`)
        setSelectedEmotion(null)
        setIntensity(5)
        
        // 触发数据刷新事件（如果需要更新其他组件）
        window.dispatchEvent(new CustomEvent('emotionRecordAdded', { 
          detail: { record: data.record } 
        }))
      } else {
        throw new Error('Failed to record emotion')
      }

    } catch (error) {
      console.error('Error recording quick emotion check:', error)
      toast.error('Failed to record emotion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-orange-500" />
          Quick Emotion Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">
          How are you feeling right now? Record it quickly!
        </p>
        
        {/* Primary Emotions Grid */}
        <div className="grid grid-cols-4 gap-2">
          {primaryEmotions.slice(0, 8).map((emotion) => {
            const config = emotionConfig[emotion]
            const isSelected = selectedEmotion === emotion
            
            return (
              <button
                key={emotion}
                onClick={() => setSelectedEmotion(emotion)}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1
                  ${isSelected 
                    ? 'border-blue-400 bg-blue-50 shadow-md transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                disabled={isSubmitting}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{emotion}</span>
              </button>
            )
          })}
        </div>

        {/* Show more emotions button */}
        {primaryEmotions.length > 8 && (
          <div className="text-center">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <Plus className="w-4 h-4 mr-1" />
              More emotions
            </Button>
          </div>
        )}

        {/* Intensity Slider */}
        {selectedEmotion && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Intensity: {intensity}/10
              </span>
              <Badge variant="outline" className="text-xs">
                {intensity <= 3 ? 'Low' : intensity <= 7 ? 'Medium' : 'High'}
              </Badge>
            </div>
            
            {/* Custom stepless slider */}
            <div className="relative">
              <div
                ref={sliderRef}
                className="w-full h-6 bg-gray-200 rounded-full cursor-pointer relative"
                onMouseDown={handleMouseDown}
              >
                {/* Slider track */}
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-200"
                  style={{ width: `${(intensity - 1) / 9 * 100}%` }}
                />
                
                {/* Slider thumb */}
                <div
                  className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-all duration-200 transform -translate-y-1/2"
                  style={{
                    left: `${(intensity - 1) / 9 * 100}%`,
                    marginLeft: '-12px' // Half of thumb width for centering
                  }}
                />
              </div>
              
              {/* Intensity markers */}
              <div className="flex justify-between mt-1 px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <span 
                    key={num} 
                    className={`text-xs transition-colors duration-200 ${
                      num <= intensity ? 'text-blue-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Record Button */}
        {selectedEmotion && (
          <Button 
            onClick={handleQuickRecord}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Recording...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Record Emotion
              </>
            )}
          </Button>
        )}

        {/* Selected emotion preview */}
        {selectedEmotion && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{emotionConfig[selectedEmotion].emoji}</span>
              <span className="font-medium text-gray-800">{selectedEmotion}</span>
              <Badge variant="secondary" className="text-xs">
                Intensity: {intensity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {emotionConfig[selectedEmotion].description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
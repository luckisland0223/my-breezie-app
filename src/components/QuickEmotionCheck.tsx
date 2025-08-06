'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotion'
import { primaryEmotions, getEmotionEmoji, emotionConfig } from '@/config/emotionConfig'
import type { EmotionType } from '@/store/emotion'
import { Heart, Plus, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function QuickEmotionCheck() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const { addEmotionRecord } = useEmotionStore()

  // Calculate intensity based on pixel position
  const calculateIntensityFromPosition = (clientX: number): number => {
    if (!sliderRef.current) return intensity
    
    const rect = sliderRef.current.getBoundingClientRect()
    const position = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const percentage = position / rect.width
    return Math.round(percentage * 10) || 1
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newIntensity = calculateIntensityFromPosition(e.clientX)
      setIntensity(newIntensity)
    }
  }, [isDragging, calculateIntensityFromPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    const newIntensity = calculateIntensityFromPosition(e.clientX)
    setIntensity(newIntensity)
  }

  const handleSliderClick = (e: React.MouseEvent) => {
    const newIntensity = calculateIntensityFromPosition(e.clientX)
    setIntensity(newIntensity)
  }

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

  const handleQuickRecord = () => {
    if (!selectedEmotion) {
      toast.error('Please select an emotion first')
      return
    }

    try {
      // Save to local store
      addEmotionRecord(selectedEmotion, intensity, `Quick check: ${selectedEmotion}, intensity ${intensity}`, 'quick_check')
      
      toast.success(`${getEmotionEmoji(selectedEmotion)} Emotion recorded successfully! Intensity: ${intensity}/10`)
      setSelectedEmotion(null)
      setIntensity(5)

    } catch (error: any) {
      toast.error('Failed to save emotion record')
    }
  }

  const getIntensityColor = (value: number) => {
    if (value <= 3) return 'bg-green-500'
    if (value <= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return 'Mild'
    if (value <= 6) return 'Moderate'
    return 'Intense'
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Emotion Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emotion Selection */}
        <div>
          <p className="text-sm text-gray-600 mb-3">Select current emotion:</p>
          <div className="grid grid-cols-3 gap-2">
            {primaryEmotions.map((emotion) => {
              const config = emotionConfig[emotion]
              const isSelected = selectedEmotion === emotion
              
              return (
                <button
                  key={emotion}
                  onClick={() => setSelectedEmotion(emotion)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                    isSelected
                      ? `border-${config.color}-500 bg-${config.color}-50 shadow-md`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-1">{getEmotionEmoji(emotion)}</div>
                  <div className={`text-xs font-medium ${
                    isSelected ? `text-${config.color}-700` : 'text-gray-600'
                  }`}>
{emotion}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Intensity Slider */}
        {selectedEmotion && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Intensity Level:</p>
              <Badge variant="secondary" className="flex items-center gap-1">
                {intensity}/10 - {getIntensityLabel(intensity)}
              </Badge>
            </div>
            
            <div 
              ref={sliderRef}
              className="relative h-8 bg-gray-200 rounded-full cursor-pointer select-none"
              onMouseDown={handleMouseDown}
              onClick={handleSliderClick}
            >
              {/* Background track with gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full opacity-50"></div>
              
              {/* Active track */}
              <div 
                className={`absolute top-0 left-0 h-full ${getIntensityColor(intensity)} rounded-full transition-all duration-200`}
                style={{ width: `${(intensity / 10) * 100}%` }}
              ></div>
              
              {/* Slider thumb */}
              <div 
                className={`absolute top-1/2 w-6 h-6 ${getIntensityColor(intensity)} border-2 border-white rounded-full shadow-lg transform -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                  isDragging ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{ left: `calc(${(intensity / 10) * 100}% - 12px)` }}
              ></div>
              
              {/* Scale markers */}
              <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div key={num} className="w-0.5 h-2 bg-gray-400 opacity-50"></div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 - Mild</span>
              <span>5 - Moderate</span>
              <span>10 - Intense</span>
            </div>
          </div>
        )}

        {/* Record Button */}
        <Button 
          onClick={handleQuickRecord}
          disabled={!selectedEmotion}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Emotion
        </Button>

        {/* Quick Tips */}
        <div className="text-xs text-gray-500 text-center">
          💡 Quickly record your current emotional state to help track mood changes
        </div>
      </CardContent>
    </Card>
  )
}
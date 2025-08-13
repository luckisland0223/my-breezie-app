'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { emotionConfig, getEmotionEmoji, primaryEmotions } from '@/config/emotionConfig'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { Heart, Plus, Zap } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
    <Card className="border-white/20 bg-white/70 shadow-lg backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Emotion Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emotion Selection */}
        <div>
          <p className="mb-3 text-gray-600 text-sm">Select current emotion:</p>
          <div className="grid grid-cols-3 gap-2">
            {primaryEmotions.map((emotion) => {
              const config = emotionConfig[emotion]
              const isSelected = selectedEmotion === emotion
              
              return (
                <button
                  type="button"
                  key={emotion}
                  onClick={() => setSelectedEmotion(emotion)}
                  className={`rounded-lg border-2 p-3 text-center transition-all duration-200 ${
                    isSelected
                      ? `border-${config.color}-500 bg-${config.color}-50 shadow-md`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="mb-1 text-2xl">{getEmotionEmoji(emotion)}</div>
                  <div className={`font-medium text-xs ${
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
              <p className="text-gray-600 text-sm">Intensity Level:</p>
              <Badge variant="secondary" className="flex items-center gap-1">
                {intensity}/10 - {getIntensityLabel(intensity)}
              </Badge>
            </div>
            
            <div 
              ref={sliderRef}
              className="relative h-8 cursor-pointer select-none rounded-full bg-gray-200"
              onMouseDown={handleMouseDown}
              onClick={handleSliderClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSliderClick(e as any)
                }
              }}
              tabIndex={0}
              role="slider"
              aria-label="Emotion intensity slider"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={intensity}
            >
              {/* Background track with gradient */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 opacity-50" />
              
              {/* Active track */}
              <div 
                className={`absolute top-0 left-0 h-full ${getIntensityColor(intensity)} rounded-full transition-all duration-200`}
                style={{ width: `${(intensity / 10) * 100}%` }}
              />
              
              {/* Slider thumb */}
              <div 
                className={`absolute top-1/2 h-6 w-6 ${getIntensityColor(intensity)} -translate-y-1/2 transform cursor-grab rounded-full border-2 border-white shadow-lg transition-all duration-200 active:cursor-grabbing ${
                  isDragging ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{ left: `calc(${(intensity / 10) * 100}% - 12px)` }}
              />
              
              {/* Scale markers */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <div key={num} className="h-2 w-0.5 bg-gray-400 opacity-50" />
                ))}
              </div>
            </div>
            
            <div className="flex justify-between text-gray-500 text-xs">
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
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Emotion
        </Button>

        {/* Quick Tips */}
        <div className="text-center text-gray-500 text-xs">
          💡 Quickly record your current emotional state to help track mood changes
        </div>
      </CardContent>
    </Card>
  )
}
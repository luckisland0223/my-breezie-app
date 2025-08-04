'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotionDatabase'
import { useAuthStore } from '@/store/auth'
import { primaryEmotions, getEmotionEmoji, emotionConfig } from '@/config/emotionConfig'
import type { EmotionType } from '@/store/emotion'
import { Heart, Plus, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function QuickEmotionCheck() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [intensity, setIntensity] = useState(5)
  const { user, isLoggedIn } = useAuthStore()
  const { addEmotionRecord } = useEmotionStore()

  const handleQuickRecord = () => {
    if (!isLoggedIn || !user?.id) {
      toast.error('Please sign in to record emotions')
      return
    }

    if (!selectedEmotion) {
      toast.error('Please select an emotion first')
      return
    }

    addEmotionRecord(selectedEmotion, intensity, `Quick check: ${selectedEmotion} at intensity ${intensity}`, 'quick_check')
    toast.success(`${getEmotionEmoji(selectedEmotion)} Emotion recorded successfully!`)
    setSelectedEmotion(null)
    setIntensity(5)
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
              <Button
                key={emotion}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`p-2 h-auto flex-col gap-1 transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-br shadow-lg scale-105' 
                    : 'hover:shadow-md hover:scale-102'
                }`}
                style={isSelected ? {
                  backgroundColor: config.color,
                  borderColor: config.color
                } : {}}
                onClick={() => setSelectedEmotion(emotion)}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {emotion}
                </span>
              </Button>
            )
          })}
        </div>

        {/* Intensity Slider */}
        {selectedEmotion && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Intensity: {intensity}/10
              </span>
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: emotionConfig[selectedEmotion].bgColor,
                  color: emotionConfig[selectedEmotion].color 
                }}
              >
                {getEmotionEmoji(selectedEmotion)} {selectedEmotion}
              </Badge>
            </div>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                step="0.01"
                value={intensity}
                onChange={(e) => {
                  const rawValue = parseFloat(e.target.value)
                  const roundedValue = Math.round(rawValue)
                  setIntensity(roundedValue)
                }}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer emotion-slider"
                style={{
                  background: `linear-gradient(to right, ${emotionConfig[selectedEmotion].color}40 0%, ${emotionConfig[selectedEmotion].color} ${(intensity - 1) * 11.11}%, #e5e7eb ${(intensity - 1) * 11.11}%, #e5e7eb 100%)`,
                  '--slider-color': emotionConfig[selectedEmotion].color,
                  '--slider-color-light': emotionConfig[selectedEmotion].color + '40'
                } as React.CSSProperties & Record<string, string>}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>
        )}

        {/* Record Button */}
        <Button 
          onClick={handleQuickRecord} 
          disabled={!selectedEmotion}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Emotion
        </Button>
      </CardContent>
    </Card>
  )
}
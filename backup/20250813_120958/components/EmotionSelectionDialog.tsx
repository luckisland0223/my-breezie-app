'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { emotionConfig, getEmotionDisplay, primaryEmotions, secondaryEmotions } from '@/config/emotionConfig'
import type { EmotionType } from '@/store/emotion'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { useState } from 'react'

interface EmotionSelectionDialogProps {
  onEmotionSelect: (emotion: EmotionType, intensity: number) => void
  onSkip: () => void
  userName?: string
}

export function EmotionSelectionDialog({ onEmotionSelect, onSkip, userName }: EmotionSelectionDialogProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [showSecondary, setShowSecondary] = useState(false)

  const handleEmotionClick = (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
  }

  const handleConfirm = () => {
    if (selectedEmotion) {
      onEmotionSelect(selectedEmotion, intensity)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="border-b text-center">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2 font-bold text-2xl text-gray-900">
                How are you feeling right now?
              </CardTitle>
              <p className="text-gray-600">
                {userName ? `Hi ${userName}! ` : ''}Based on our conversation, I'd like to understand your emotions better. 
                Please select the emotion that best describes how you're feeling.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSkip}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Primary Emotions */}
          <div className="mb-6">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Primary Emotions</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {primaryEmotions.map((emotion) => {
                const config = emotionConfig[emotion]
                const isSelected = selectedEmotion === emotion
                return (
                  <Button
                    key={emotion}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto flex-col gap-2 p-4 transition-all duration-200 ${
                      isSelected 
                        ? `bg-gradient-to-br from-${config.color}to-${config.color}/80 scale-105 text-white shadow-lg` 
                        : `border-2 hover:scale-102 hover:shadow-md hover:border-${config.color}/30`
                    }`}
                    onClick={() => handleEmotionClick(emotion)}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <span className="font-medium text-sm">{emotion}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Secondary Emotions Toggle */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowSecondary(!showSecondary)}
              className="flex w-full items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
            >
              {showSecondary ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide More Emotions
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show More Emotions
                </>
              )}
            </Button>
            
            {showSecondary && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {secondaryEmotions.map((emotion) => {
                  const config = emotionConfig[emotion]
                  const isSelected = selectedEmotion === emotion
                  return (
                    <Button
                      key={emotion}
                      variant={isSelected ? "default" : "outline"}
                      className={`h-auto flex-col gap-1 p-3 text-xs transition-all duration-200 ${
                        isSelected 
                          ? `bg-gradient-to-br from-${config.color}to-${config.color}/80 scale-105 text-white shadow-lg` 
                          : `border-2 hover:scale-102 hover:shadow-md hover:border-${config.color}/30`
                      }`}
                      onClick={() => handleEmotionClick(emotion)}
                    >
                      <span className="text-lg">{config.emoji}</span>
                      <span className="font-medium">{emotion}</span>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Intensity Selection */}
          {selectedEmotion && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-gray-900 text-lg">
                How intense is this {getEmotionDisplay(selectedEmotion)} feeling?
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Very Mild</span>
                  <span>Moderate</span>
                  <span>Very Intense</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                  style={{
                    background: `linear-gradient(to right, ${emotionConfig[selectedEmotion].color}20 0%, ${emotionConfig[selectedEmotion].color} ${intensity * 10}%, #e5e7eb ${intensity * 10}%, #e5e7eb 100%)`
                  }}
                />
                <div className="text-center">
                  <Badge 
                    variant="secondary" 
                    className="px-4 py-2 text-lg"
                    style={{ 
                      backgroundColor: emotionConfig[selectedEmotion].bgColor,
                      color: emotionConfig[selectedEmotion].color 
                    }}
                  >
                    Intensity: {intensity}/10
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onSkip}
              className="px-6"
            >
              Skip for Now
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedEmotion}
              className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 text-white hover:from-blue-600 hover:to-purple-700"
            >
              Confirm Emotion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
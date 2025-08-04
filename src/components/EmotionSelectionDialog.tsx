'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { EmotionType } from '@/store/emotion'
import { primaryEmotions, secondaryEmotions, getEmotionDisplay, emotionConfig } from '@/config/emotionConfig'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="text-center border-b">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
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
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Primary Emotions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Emotions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {primaryEmotions.map((emotion) => {
                const config = emotionConfig[emotion]
                const isSelected = selectedEmotion === emotion
                return (
                  <Button
                    key={emotion}
                    variant={isSelected ? "default" : "outline"}
                    className={`p-4 h-auto flex-col gap-2 transition-all duration-200 ${
                      isSelected 
                        ? `bg-gradient-to-br from-${config.color} to-${config.color}/80 text-white shadow-lg scale-105` 
                        : `hover:shadow-md hover:scale-102 border-2 hover:border-${config.color}/30`
                    }`}
                    onClick={() => handleEmotionClick(emotion)}
                  >
                    <span className="text-2xl">{config.emoji}</span>
                    <span className="text-sm font-medium">{emotion}</span>
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
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
            >
              {showSecondary ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide More Emotions
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show More Emotions
                </>
              )}
            </Button>
            
            {showSecondary && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {secondaryEmotions.map((emotion) => {
                  const config = emotionConfig[emotion]
                  const isSelected = selectedEmotion === emotion
                  return (
                    <Button
                      key={emotion}
                      variant={isSelected ? "default" : "outline"}
                      className={`p-3 h-auto flex-col gap-1 transition-all duration-200 text-xs ${
                        isSelected 
                          ? `bg-gradient-to-br from-${config.color} to-${config.color}/80 text-white shadow-lg scale-105` 
                          : `hover:shadow-md hover:scale-102 border-2 hover:border-${config.color}/30`
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
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How intense is this {getEmotionDisplay(selectedEmotion)} feeling?
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${emotionConfig[selectedEmotion].color}20 0%, ${emotionConfig[selectedEmotion].color} ${intensity * 10}%, #e5e7eb ${intensity * 10}%, #e5e7eb 100%)`
                  }}
                />
                <div className="text-center">
                  <Badge 
                    variant="secondary" 
                    className="text-lg px-4 py-2"
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
          <div className="flex gap-3 justify-end">
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
              className="px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Confirm Emotion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
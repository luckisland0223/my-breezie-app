'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const { user, isLoggedIn } = useAuthStore()
  const { addEmotionRecord } = useEmotionStore()

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

    try {
      // 调用数据库API保存快速情绪检查
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
        // 同时保存到本地store以更新UI
        addEmotionRecord(selectedEmotion, intensity, `Quick check: ${selectedEmotion} at intensity ${intensity}`, 'quick_check')
        
        toast.success(`${getEmotionEmoji(selectedEmotion)} Emotion recorded successfully!`)
        setSelectedEmotion(null)
        setIntensity(5)
        
        // 触发数据刷新事件
        window.dispatchEvent(new CustomEvent('emotionRecordAdded', { 
          detail: { record: data.record, type: 'quick_check' } 
        }))
      } else {
        throw new Error('Failed to record emotion')
      }

    } catch (error: any) {
      console.error('Error recording quick emotion check:', error)
      
      // 根据错误类型显示不同的提示
      if (error.message?.includes('Database tables do not exist')) {
        toast.error('数据库表不存在。请前往设置页面进行一键设置。', {
          duration: 5000,
          action: {
            label: '前往设置',
            onClick: () => window.location.href = '/settings'
          }
        })
      } else if (error.message?.includes('Access denied') || error.message?.includes('row-level security policy')) {
        toast.error('访问被拒绝。请重新登录以确保正确认证。', {
          duration: 5000,
          action: {
            label: '重新登录',
            onClick: () => window.location.href = '/auth/signin'
          }
        })
      } else if (error.message?.includes('Authentication failed') || error.message?.includes('Authentication required')) {
        toast.error('认证失败，请重新登录。', {
          duration: 5000,
          action: {
            label: '重新登录',
            onClick: () => window.location.href = '/auth/signin'
          }
        })
      } else if (error.message?.includes('Database connection failed')) {
        toast.error('数据库连接失败。请检查 Supabase 配置。', {
          duration: 5000,
          action: {
            label: '前往设置',
            onClick: () => window.location.href = '/settings'
          }
        })
      } else {
        toast.error('记录情绪失败，请稍后重试。')
      }
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
            <div 
              ref={sliderRef}
              className="relative h-3 bg-gray-200 rounded-full cursor-pointer select-none"
              onMouseDown={handleMouseDown}
              style={{
                background: `linear-gradient(to right, ${emotionConfig[selectedEmotion].color}40 0%, ${emotionConfig[selectedEmotion].color} ${(intensity - 1) / 9 * 100}%, #e5e7eb ${(intensity - 1) / 9 * 100}%, #e5e7eb 100%)`
              }}
            >
              {/* Slider thumb */}
              <div
                className="absolute top-1/2 w-5 h-5 bg-white border-2 rounded-full shadow-lg transition-transform duration-75"
                style={{
                  left: `${(intensity - 1) / 9 * 100}%`,
                  borderColor: emotionConfig[selectedEmotion].color,
                  transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.2)' : 'scale(1)'}`,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
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
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Emotion
        </Button>
      </CardContent>
    </Card>
  )
}
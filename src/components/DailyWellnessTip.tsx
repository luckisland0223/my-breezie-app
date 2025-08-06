'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, RefreshCw, Heart, Brain, Smile } from 'lucide-react'
import { useState } from 'react'

const wellnessTips = [
  {
    category: 'Mindfulness',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    tip: 'Take 3 deep breaths and notice 5 things you can see around you right now.',
    benefit: 'Helps ground you in the present moment and reduce anxiety.'
  },
  {
    category: 'Gratitude',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    tip: 'Write down 3 things you\'re grateful for today, no matter how small.',
    benefit: 'Practicing gratitude can improve mood and overall life satisfaction.'
  },
  {
    category: 'Self-Care',
    icon: Smile,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    tip: 'Do something kind for yourself today - drink your favorite tea, listen to music, or take a short walk.',
    benefit: 'Self-compassion is essential for emotional well-being.'
  },
  {
    category: 'Connection',
    icon: Heart,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    tip: 'Reach out to someone you care about today, even if it\'s just a quick message.',
    benefit: 'Social connections are vital for mental health and happiness.'
  },
  {
    category: 'Movement',
    icon: Brain,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    tip: 'Stand up and stretch for 2 minutes, or take a brief walk around your space.',
    benefit: 'Physical movement can instantly boost mood and energy levels.'
  },
  {
    category: 'Breathing',
    icon: Brain,
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
    tip: 'Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.',
    benefit: 'Controlled breathing activates your body\'s relaxation response.'
  },
  {
    category: 'Reflection',
    icon: Lightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    tip: 'Ask yourself: "What went well today?" and celebrate even small victories.',
    benefit: 'Positive reflection helps build resilience and self-appreciation.'
  },
  {
    category: 'Boundaries',
    icon: Heart,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    tip: 'It\'s okay to say "no" to requests that drain your energy. Your well-being matters.',
    benefit: 'Setting boundaries protects your mental health and energy.'
  }
]

export function DailyWellnessTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(
    Math.floor(Math.random() * wellnessTips.length)
  )

  const currentTip = wellnessTips[currentTipIndex] || wellnessTips[0]
  
  if (!currentTip) {
    return null // Fallback if no tips available
  }
  
  const IconComponent = currentTip.icon

  const getNewTip = () => {
    const availableIndices = wellnessTips
      .map((_, index) => index)
      .filter(index => index !== currentTipIndex)
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      if (randomIndex !== undefined) {
        setCurrentTipIndex(randomIndex)
      }
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Lightbulb className="w-5 h-5" />
            Daily Wellness Tip
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={getNewTip}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg ${currentTip.bgColor}`}>
            <IconComponent className={`w-5 h-5 ${currentTip.color}`} />
          </div>
          <Badge variant="secondary" className="text-sm font-medium">
            {currentTip.category}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <p className="text-gray-800 font-medium text-sm leading-relaxed">
              {currentTip.tip}
            </p>
          </div>
          
          <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/30">
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <Heart className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="italic">{currentTip.benefit}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
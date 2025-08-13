'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { Brain, Heart, Lightbulb, RefreshCw, Shield, Smile, Sun, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

// Emotion-based wellness tips
const emotionBasedTips: Record<EmotionType, Array<{
  category: string
  icon: any
  color: string
  bgColor: string
  tip: string
  benefit: string
}>> = {
  'Sadness': [
    {
      category: 'Gentle Support',
      icon: Heart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      tip: 'Allow yourself to feel sad - it\'s a natural emotion. Try journaling about what you\'re experiencing.',
      benefit: 'Acknowledging sadness helps you process emotions rather than suppress them.'
    },
    {
      category: 'Self-Compassion',
      icon: Smile,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      tip: 'Treat yourself with the same kindness you\'d show a good friend. Take a warm bath or listen to soothing music.',
      benefit: 'Self-compassion during difficult times promotes emotional healing.'
    },
    {
      category: 'Connection',
      icon: Heart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      tip: 'Reach out to someone you trust. Sometimes sharing your feelings can lighten the emotional load.',
      benefit: 'Social support is crucial for processing difficult emotions.'
    }
  ],
  'Anxiety': [
    {
      category: 'Grounding',
      icon: Brain,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      tip: 'Try the 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
      benefit: 'Grounding techniques help bring your mind back to the present moment.'
    },
    {
      category: 'Breathing',
      icon: Brain,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      tip: 'Practice box breathing: inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat 5 times.',
      benefit: 'Controlled breathing activates your parasympathetic nervous system, reducing anxiety.'
    },
    {
      category: 'Movement',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      tip: 'Take a 5-minute walk or do gentle stretches. Physical movement helps release nervous energy.',
      benefit: 'Exercise naturally reduces stress hormones and releases mood-boosting endorphins.'
    }
  ],
  'Anger': [
    {
      category: 'Cool Down',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      tip: 'Take a 10-minute break before responding to what made you angry. Count to 10 slowly.',
      benefit: 'Cooling down prevents impulsive reactions and helps you respond more thoughtfully.'
    },
    {
      category: 'Physical Release',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      tip: 'Do some vigorous exercise - jumping jacks, push-ups, or punch a pillow to release tension.',
      benefit: 'Physical activity helps metabolize stress hormones and release built-up energy.'
    },
    {
      category: 'Reflection',
      icon: Lightbulb,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      tip: 'Ask yourself: "What boundary was crossed?" or "What need isn\'t being met?" Anger often signals something important.',
      benefit: 'Understanding the root cause of anger helps you address the real issue.'
    }
  ],
  'Joy': [
    {
      category: 'Gratitude',
      icon: Sun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      tip: 'Savor this positive moment! Write down what\'s making you happy and why it matters to you.',
      benefit: 'Savoring positive emotions helps extend their benefits and builds resilience.'
    },
    {
      category: 'Sharing',
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      tip: 'Share your joy with someone you care about. Positive emotions are contagious!',
      benefit: 'Sharing happiness strengthens relationships and amplifies positive feelings.'
    },
    {
      category: 'Mindfulness',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      tip: 'Take a moment to fully experience this happiness. Notice how it feels in your body.',
      benefit: 'Mindful awareness of positive emotions helps you appreciate and remember them better.'
    }
  ],
  'Fear': [
    {
      category: 'Safety',
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      tip: 'Remind yourself that you are safe right now. Look around and identify 3 things that make you feel secure.',
      benefit: 'Recognizing current safety helps calm your nervous system\'s fear response.'
    },
    {
      category: 'Small Steps',
      icon: Lightbulb,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      tip: 'Break down what you\'re afraid of into smaller, manageable steps. Focus on just the next small action.',
      benefit: 'Taking small steps builds confidence and makes challenges feel less overwhelming.'
    },
    {
      category: 'Support',
      icon: Heart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      tip: 'Talk to someone you trust about your fears. Sometimes saying them out loud reduces their power.',
      benefit: 'Sharing fears with others can provide perspective and emotional support.'
    }
  ],
  // Default tips for other emotions
  'Disgust': [
    {
      category: 'Boundaries',
      icon: Shield,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      tip: 'Trust your instincts. If something feels wrong, it\'s okay to remove yourself from the situation.',
      benefit: 'Honoring your feelings of disgust helps maintain healthy boundaries.'
    }
  ],
  'Surprise': [
    {
      category: 'Adaptation',
      icon: Brain,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      tip: 'Take a moment to process unexpected changes. It\'s normal to need time to adjust.',
      benefit: 'Allowing time to process surprises helps you respond more thoughtfully.'
    }
  ],
  'Love': [
    {
      category: 'Expression',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      tip: 'Express your love today - tell someone you care about them or do something kind.',
      benefit: 'Expressing love strengthens relationships and increases your own happiness.'
    }
  ],
  'Pride': [
    {
      category: 'Celebration',
      icon: Sun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      tip: 'Celebrate your achievements! Take time to acknowledge your hard work and progress.',
      benefit: 'Recognizing your accomplishments builds self-confidence and motivation.'
    }
  ],
  'Shame': [
    {
      category: 'Self-Compassion',
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      tip: 'Remember that everyone makes mistakes. You are worthy of love and forgiveness, especially from yourself.',
      benefit: 'Self-compassion helps heal shame and promotes emotional resilience.'
    }
  ],
  'Envy': [
    {
      category: 'Gratitude',
      icon: Heart,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      tip: 'Focus on what you have rather than what you lack. Write down 3 things you\'re grateful for.',
      benefit: 'Gratitude practice naturally counters envious feelings and improves life satisfaction.'
    }
  ],
  'Guilt': [
    {
      category: 'Action',
      icon: Lightbulb,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      tip: 'If you\'ve wronged someone, consider making amends. If not, practice self-forgiveness.',
      benefit: 'Taking appropriate action helps resolve guilt and restore inner peace.'
    }
  ],
  'Hope': [
    {
      category: 'Vision',
      icon: Sun,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      tip: 'Write down what you\'re hoping for and one small step you can take toward it today.',
      benefit: 'Connecting hope with action increases motivation and likelihood of positive outcomes.'
    }
  ],
  'Excitement': [
    {
      category: 'Energy',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      tip: 'Channel your excitement into productive action! Start working on something you\'re passionate about.',
      benefit: 'Using excitement as fuel for action creates momentum and positive progress.'
    }
  ],
  'Boredom': [
    {
      category: 'Curiosity',
      icon: Lightbulb,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      tip: 'Try something new today - learn a fun fact, take a different route, or start a creative project.',
      benefit: 'Novelty stimulates the brain and can transform boredom into engagement.'
    }
  ],
  'Confusion': [
    {
      category: 'Clarity',
      icon: Brain,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      tip: 'Write down what you\'re confused about. Sometimes putting thoughts on paper brings clarity.',
      benefit: 'Externalizing confusion helps organize thoughts and identify next steps.'
    }
  ],
  'Gratitude': [
    {
      category: 'Appreciation',
      icon: Heart,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      tip: 'Share your gratitude with someone who has made a positive impact on your life.',
      benefit: 'Expressing gratitude strengthens relationships and amplifies positive feelings.'
    }
  ],
  'Loneliness': [
    {
      category: 'Connection',
      icon: Heart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      tip: 'Reach out to someone today - call a friend, text a family member, or join a community activity.',
      benefit: 'Taking small steps to connect with others helps combat loneliness.'
    }
  ],
  'Frustration': [
    {
      category: 'Problem-Solving',
      icon: Lightbulb,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      tip: 'Break down what\'s frustrating you into smaller parts. Which piece can you tackle first?',
      benefit: 'Problem-solving approach transforms frustration into productive action.'
    }
  ],
  'Contentment': [
    {
      category: 'Presence',
      icon: Brain,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      tip: 'Savor this moment of peace. Take a few deep breaths and appreciate the calm you\'re feeling.',
      benefit: 'Mindfully enjoying contentment helps you remember and recreate these peaceful states.'
    }
  ],
  'Other': [
    {
      category: 'Self-Awareness',
      icon: Brain,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      tip: 'Take a moment to check in with yourself. How are you really feeling right now?',
      benefit: 'Regular emotional check-ins improve self-awareness and emotional intelligence.'
    }
  ]
}

// Default general wellness tips as fallback
const defaultWellnessTips = [
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
  }
]

export function DailyWellnessTip() {
  const { records } = useEmotionStore()
  const [currentTip, setCurrentTip] = useState<any>(null)
  const [availableTips, setAvailableTips] = useState<any[]>([])

  // Function to analyze recent emotions and get relevant tips
  const getEmotionBasedTips = () => {
    // Get recent emotions from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentRecords = records.filter(record => 
      new Date(record.timestamp) >= sevenDaysAgo
    )

    if (recentRecords.length === 0) {
      return defaultWellnessTips
    }

    // Count emotion frequencies
    const emotionCounts: Record<string, number> = {}
    recentRecords.forEach(record => {
      // Use AI-assessed emotion if available, otherwise use user's selection
      const emotion = record.emotionEvaluation?.actualEmotion || record.emotion
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })

    // Get the most frequent emotions
    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3) // Top 3 emotions

    // Collect tips for these emotions
    const relevantTips: any[] = []
    sortedEmotions.forEach(([emotion]) => {
      const emotionTips = emotionBasedTips[emotion as EmotionType]
      if (emotionTips && emotionTips.length > 0) {
        relevantTips.push(...emotionTips)
      }
    })

    // If no specific tips found, use default
    return relevantTips.length > 0 ? relevantTips : defaultWellnessTips
  }

  // Initialize tips based on recent emotions
  useEffect(() => {
    const tips = getEmotionBasedTips()
    setAvailableTips(tips)
    setCurrentTip(tips[Math.floor(Math.random() * tips.length)])
  }, [records])
  
  if (!currentTip) {
    return null
  }
  
  const IconComponent = currentTip.icon

  const getNewTip = () => {
    const tips = getEmotionBasedTips()
    const availableIndices = tips
      .map((_, index) => index)
      .filter(index => tips[index] !== currentTip)
    
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      if (randomIndex !== undefined && tips[randomIndex]) {
        setCurrentTip(tips[randomIndex])
      }
    }
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Lightbulb className="h-5 w-5" />
              Wellness Tips
          </CardTitle>
            <p className="mt-1 text-blue-600 text-xs">Based on your recent emotions</p>
          </div>
          <Button variant="ghost" size="sm" onClick={getNewTip}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-3 flex items-center gap-2">
          <div className={`rounded-lg p-2 ${currentTip.bgColor}`}>
            <IconComponent className={`h-5 w-5 ${currentTip.color}`} />
          </div>
          <Badge variant="secondary" className="px-3 py-1 font-semibold text-lg">
            {currentTip.category}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/40 bg-white/60 p-4 backdrop-blur-sm">
            <p className="font-medium text-gray-800 text-sm leading-relaxed">
              {currentTip.tip}
            </p>
          </div>
          
          <div className="rounded-lg border border-white/30 bg-white/40 p-3 backdrop-blur-sm">
            <p className="flex items-start gap-2 text-gray-600 text-xs">
              <Heart className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-400" />
              <span className="italic">{currentTip.benefit}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { emotionConfig, getEmotionDisplay, getEmotionEmoji } from '@/config/emotionConfig'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionRecord, EmotionType } from '@/store/emotion'
import { Heart, Lightbulb, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

// Comprehensive advice mapping for all emotion types
const adviceMap: Record<EmotionType, { title: string; tips: string[] }> = {
  'Anger': {
    title: '😠 Managing Anger',
    tips: [
      'Take 10 deep breaths before responding',
      'Express anger through physical exercise',
      'Write down your thoughts to process them',
      'Talk to someone you trust about your feelings',
      'Practice the "STOP" technique: Stop, Take a breath, Observe, Proceed mindfully'
    ]
  },
  'Disgust': {
    title: '🤢 Dealing with Disgust',
    tips: [
      'Identify what specifically triggers this feeling',
      'Remove yourself from the situation if possible',
      'Practice acceptance of what you cannot change',
      'Focus on your personal values and boundaries',
      'Consider if this feeling is protecting you from something harmful'
    ]
  },
  'Fear': {
    title: '😰 Overcoming Fear',
    tips: [
      'Face fears gradually in small, manageable steps',
      'Practice grounding techniques like 5-4-3-2-1 sensory awareness',
      'Challenge negative thoughts with facts',
      'Seek support from friends, family, or professionals',
      'Remember that courage is acting despite fear, not the absence of fear'
    ]
  },
  'Joy': {
    title: '😊 Amplifying Joy',
    tips: [
      'Share your happiness with others',
      'Practice gratitude for positive moments',
      'Engage in activities that bring you fulfillment',
      'Savor and be present in joyful experiences',
      'Use this positive energy to tackle challenges'
    ]
  },
  'Sadness': {
    title: '😢 Navigating Sadness',
    tips: [
      'Allow yourself to feel sad - it\'s a natural healing process',
      'Reach out to supportive friends or family',
      'Engage in self-care activities that comfort you',
      'Consider what this sadness might be teaching you',
      'Seek professional help if sadness persists or interferes with daily life'
    ]
  },
  'Surprise': {
    title: '😲 Processing Surprise',
    tips: [
      'Take time to process unexpected information',
      'Stay curious and open to new possibilities',
      'Don\'t rush to make immediate decisions',
      'Ask questions to better understand the situation',
      'Use surprise as an opportunity for growth and learning'
    ]
  },
  'Anxiety': {
    title: '😟 Managing Anxiety',
    tips: [
      'Practice deep breathing exercises regularly',
      'Break large problems into smaller, manageable steps',
      'Challenge catastrophic thinking with realistic alternatives',
      'Establish a calming routine for stressful times',
      'Consider mindfulness or meditation practices'
    ]
  },
  'Love': {
    title: '❤️ Nurturing Love',
    tips: [
      'Express love through words and actions',
      'Practice self-love and self-compassion',
      'Spend quality time with loved ones',
      'Show appreciation for the people you care about',
      'Remember that love requires both giving and receiving'
    ]
  },
  'Pride': {
    title: '😎 Healthy Pride',
    tips: [
      'Celebrate your achievements mindfully',
      'Share your success story to inspire others',
      'Use confidence to set new goals',
      'Remember to stay humble and grateful',
      'Help others achieve their own successes'
    ]
  },
  'Shame': {
    title: '😳 Overcoming Shame',
    tips: [
      'Practice self-compassion instead of self-criticism',
      'Talk to a trusted friend or therapist',
      'Remember that mistakes don\'t define your worth',
      'Focus on learning and growth from experiences',
      'Challenge perfectionist thinking patterns'
    ]
  },
  'Envy': {
    title: '😒 Transforming Envy',
    tips: [
      'Use envy as information about what you value',
      'Focus on your own journey and progress',
      'Practice gratitude for what you have',
      'Channel envious energy into motivation for growth',
      'Celebrate others\' successes genuinely'
    ]
  },
  'Guilt': {
    title: '😔 Processing Guilt',
    tips: [
      'Distinguish between healthy guilt and toxic shame',
      'Make amends where appropriate and possible',
      'Learn from mistakes without dwelling on them',
      'Practice self-forgiveness after taking responsibility',
      'Focus on future actions rather than past regrets'
    ]
  },
  'Hope': {
    title: '🌟 Cultivating Hope',
    tips: [
      'Set realistic, achievable goals',
      'Celebrate small progress and victories',
      'Surround yourself with positive influences',
      'Practice visualization of positive outcomes',
      'Remember past challenges you\'ve overcome'
    ]
  },
  'Excitement': {
    title: '🤩 Channeling Excitement',
    tips: [
      'Plan carefully to make the most of opportunities',
      'Share your excitement with supportive people',
      'Stay grounded while pursuing new ventures',
      'Use excitement as fuel for taking action',
      'Balance enthusiasm with practical preparation'
    ]
  },
  'Boredom': {
    title: '😴 Overcoming Boredom',
    tips: [
      'Try a new hobby or learn a new skill',
      'Volunteer for a cause you care about',
      'Reconnect with old friends or make new ones',
      'Set fresh goals or challenges for yourself',
      'Use boredom as an opportunity for self-reflection'
    ]
  },
  'Confusion': {
    title: '😕 Clearing Confusion',
    tips: [
      'Break complex problems into smaller parts',
      'Seek information from reliable sources',
      'Ask questions and don\'t be afraid to admit uncertainty',
      'Give yourself time to process new information',
      'Consult with trusted advisors or mentors'
    ]
  },
  'Gratitude': {
    title: '🙏 Expressing Gratitude',
    tips: [
      'Keep a daily gratitude journal',
      'Express thanks to people who have helped you',
      'Focus on small daily blessings',
      'Practice mindful appreciation of experiences',
      'Use gratitude to shift perspective during challenges'
    ]
  },
  'Loneliness': {
    title: '😞 Addressing Loneliness',
    tips: [
      'Reach out to friends, family, or community groups',
      'Engage in activities where you can meet like-minded people',
      'Consider volunteering to connect with others',
      'Practice self-compassion and self-care',
      'Remember that quality of connections matters more than quantity'
    ]
  },
  'Frustration': {
    title: '😤 Managing Frustration',
    tips: [
      'Take a break when frustration peaks',
      'Try a different approach to the problem',
      'Ask for help or different perspectives',
      'Practice patience with yourself and the process',
      'Channel frustration into determined problem-solving'
    ]
  },
  'Contentment': {
    title: '😌 Savoring Contentment',
    tips: [
      'Practice mindfulness to fully experience peace',
      'Express gratitude for your current state',
      'Use this calm energy for reflection and planning',
      'Share your sense of peace with others',
      'Maintain routines that support your well-being'
    ]
  },
  'Other': {
    title: '🤔 Understanding Complex Emotions',
    tips: [
      'Take time to identify and name your specific feelings',
      'Journal about your emotional experience',
      'Talk to someone about what you\'re going through',
      'Be patient with yourself as you process',
      'Remember that all emotions are valid and temporary'
    ]
  }
}

interface EmotionAdviceProps {
  className?: string
}

export function EmotionAdvice({ className = '' }: EmotionAdviceProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  
  const allRecords = useEmotionStore((state) => state.records)
  // Filter records for current user
  const records = useMemo(() => {
    try {
      const savedUser = localStorage.getItem('breezie_current_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        return allRecords.filter((record) => record.user_id === user.id)
      }
    } catch (error) {
      // Ignore error
    }
    return allRecords
  }, [allRecords])
  const stats = useEmotionStore((state) => state.getEmotionStats())

  // Get recent emotion pattern (last 7 days)
  const getRecentEmotionPattern = () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentRecords = records.filter(record => 
      new Date(record.timestamp) >= sevenDaysAgo
    )

    if (recentRecords.length === 0) return null

    // Find most frequent recent emotion
    const emotionCount: Record<string, number> = {}
    recentRecords.forEach(record => {
      emotionCount[record.emotion] = (emotionCount[record.emotion] || 0) + 1
    })

    const mostFrequent = Object.entries(emotionCount).reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    )

    return {
      emotion: mostFrequent[0] as EmotionType,
      count: mostFrequent[1],
      totalRecords: recentRecords.length
    }
  }

  const getPersonalizedAdvice = () => {
    const recentPattern = getRecentEmotionPattern()
    const primaryEmotion = recentPattern?.emotion

    if (!primaryEmotion) {
      return {
        title: '🌟 Welcome to Your Emotional Journey',
        tips: [
          'Start by tracking your emotions daily',
          'Be honest about how you\'re feeling',
          'Remember that all emotions are valid',
          'Use this tool to identify patterns in your emotional life',
          'Consider talking to friends, family, or professionals about your feelings'
        ]
      }
    }

    return adviceMap[primaryEmotion] || adviceMap.Other
  }

  const personalizedAdvice = getPersonalizedAdvice()
  const recentPattern = getRecentEmotionPattern()

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Card className={`border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Lightbulb className="h-5 w-5" />
            Personalized Advice
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentPattern && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Recent Pattern
              </Badge>
            </div>
            <p className="text-gray-600 text-sm">
              You've experienced <span className="font-medium">{getEmotionDisplay(recentPattern.emotion)}</span> most 
              frequently in the past week ({recentPattern.count} out of {recentPattern.totalRecords} records).
            </p>
          </div>
        )}

        <div>
          <h4 className="mb-3 font-semibold text-gray-900 text-lg">
            {personalizedAdvice.title}
          </h4>
          <ul className="space-y-2">
            {personalizedAdvice.tips.map((tip, index) => (
              <li key={`${refreshKey}-${index}`} className="flex items-start gap-2 text-gray-700 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-lg border border-white/40 bg-white/60 p-3 backdrop-blur-sm">
          <p className="flex items-center gap-1 text-gray-600 text-xs">
            <Heart className="h-3 w-3 text-red-400" />
            Remember: It's okay to seek professional help if you need additional support.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { 
  Lightbulb, 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Sparkles,
  ArrowRight,
  Calendar,
  Target
} from 'lucide-react'

interface EmotionAdviceProps {
  className?: string
}

export function EmotionAdvice({ className = '' }: EmotionAdviceProps) {
  const records = useEmotionStore((state) => state.records)
  const getRecentEmotions = useEmotionStore((state) => state.getRecentEmotions)

  // Get emotion records from the last 7 days
  const recentEmotions = getRecentEmotions(7)
  
  // Analyze emotion patterns
  const analyzeEmotionPattern = () => {
    if (recentEmotions.length === 0) {
      return {
        primaryEmotion: 'Joy' as EmotionType,
        pattern: 'stable',
        advice: 'Start tracking your emotions to understand your emotional patterns and gain insights into your wellbeing',
        icon: Sparkles,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    }

    // Count emotion frequencies
    const emotionCounts: { [key: string]: number } = {}
    recentEmotions.forEach(record => {
      const emotion = record.emotionEvaluation?.actualEmotion || record.emotion
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })

    // Find the primary emotion
    const primaryEmotion = Object.entries(emotionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as EmotionType
    
    // Analyze emotion change patterns
    const positiveEmotions = ['Joy', 'Surprise']
    const negativeEmotions = ['Anger', 'Fear', 'Sadness', 'Disgust']
    
    const positiveCount = recentEmotions.filter(r => 
      positiveEmotions.includes(r.emotionEvaluation?.actualEmotion || r.emotion)
    ).length
    
    const negativeCount = recentEmotions.filter(r => 
      negativeEmotions.includes(r.emotionEvaluation?.actualEmotion || r.emotion)
    ).length

    let pattern = 'stable'
    let advice = ''
    let icon = Brain
    let color = 'text-gray-600'
    let bgColor = 'bg-gray-50'

    if (positiveCount > negativeCount && positiveCount >= 3) {
      pattern = 'positive'
      advice = 'Your emotional state is excellent! Continue maintaining this positive mindset and share joyful moments with friends and loved ones'
      icon = TrendingUp
      color = 'text-green-600'
      bgColor = 'bg-green-50'
    } else if (negativeCount > positiveCount && negativeCount >= 3) {
      pattern = 'negative'
      advice = 'Your emotions have been challenging recently. Consider outdoor activities, connecting with loved ones, and seeking professional support if needed'
      icon = TrendingDown
      color = 'text-red-600'
      bgColor = 'bg-red-50'
    } else {
      pattern = 'mixed'
      advice = 'Emotional ups and downs are normal. Consider maintaining regular routines, practicing meditation, or deep breathing to stabilize your emotions'
      icon = Brain
      color = 'text-blue-600'
      bgColor = 'bg-blue-50'
    }

    return {
      primaryEmotion,
      pattern,
      advice,
      icon,
      color,
      bgColor
    }
  }

  const analysis = analyzeEmotionPattern()
  const IconComponent = analysis.icon

  // Generate personalized advice
  const getPersonalizedAdvice = () => {
    const { primaryEmotion, pattern } = analysis
    
      const adviceMap = {
    'Anger': {
      title: 'Anger Management Strategies',
      tips: [
        'Practice deep breathing: Inhale for 4 seconds, hold for 4 seconds, exhale for 6 seconds',
        'Remove yourself temporarily from anger-triggering situations',
        'Write down your feelings to help clarify your thoughts and gain perspective',
        'Engage in physical exercise to release built-up tension and stress',
        'Use the "STOP" technique: Stop, Take a breath, Observe, and Proceed mindfully',
        'Practice progressive muscle relaxation to reduce physical tension'
      ]
    },
    'Disgust': {
      title: 'Processing Disgust and Aversion',
      tips: [
        'Identify the specific triggers that cause feelings of disgust',
        'Try to change your environment or perspective on the situation',
        'Practice acceptance of imperfection in yourself and others',
        'Look for positive aspects or learning opportunities in challenging situations',
        'Use mindfulness to observe disgust without being overwhelmed by it',
        'Consider whether your disgust signals important values or boundaries'
      ]
    },
    'Fear': {
      title: 'Anxiety and Fear Management',
      tips: [
        'Practice progressive muscle relaxation techniques',
        'Create specific, achievable goals and step-by-step action plans',
        'Limit caffeine and alcohol intake as they can increase anxiety',
        'Seek support from a professional therapist or counselor',
        'Challenge negative thought patterns with evidence-based thinking',
        'Use grounding techniques: name 5 things you see, 4 you hear, 3 you touch',
        'Practice exposure therapy gradually with professional guidance'
      ]
    },
    'Joy': {
      title: 'Sustaining Positive Emotions',
      tips: [
        'Keep a gratitude journal to record meaningful moments',
        'Share your happiness with friends and loved ones',
        'Engage in acts of kindness to spread positivity',
        'Maintain a grateful mindset and appreciate small victories',
        'Create positive rituals and celebrations for achievements',
        'Practice savoring: fully experience and appreciate joyful moments',
        'Build on your strengths and what brings you fulfillment'
      ]
    },
    'Sadness': {
      title: 'Navigating Sadness and Grief',
      tips: [
        'Allow yourself to feel sadness without judgment or suppression',
        'Reach out to trusted friends, family, or support groups',
        'Explore new hobbies or interests to create positive experiences',
        'Maintain regular sleep schedules and nutritious eating habits',
        'Practice self-compassion and treat yourself with kindness',
        'Consider professional counseling if sadness persists or interferes with daily life',
        'Engage in gentle physical activity like walking or yoga'
      ]
    },
    'Surprise': {
      title: 'Adapting to Unexpected Changes',
      tips: [
        'Give yourself time to process new information or situations',
        'Maintain an open and curious mindset toward unexpected events',
        'Share your discoveries or experiences with others',
        'Transform surprise into learning and growth opportunities',
        'Practice flexibility and adaptability in your responses',
        'Use surprise as a chance to reassess your assumptions and beliefs',
        'Embrace uncertainty as a natural part of life and growth'
      ]
    },
    'Complex': {
      title: 'Managing Mixed and Complex Emotions',
      tips: [
        'Spend time in solitude to reflect on and understand your feelings',
        'Keep an emotion journal to track patterns and triggers',
        'Practice mindfulness meditation and present-moment awareness',
        'Work with a therapist to explore complex emotional landscapes',
        'Break down complex feelings into their component parts',
        'Practice self-validation: acknowledge that complex emotions are normal',
        'Use creative expression like art, music, or writing to process feelings'
      ]
    }
  }

    return adviceMap[primaryEmotion] || adviceMap['Complex']
  }

  const personalizedAdvice = getPersonalizedAdvice()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Emotion pattern analysis */}
      <Card className={`${analysis.bgColor} border-0 shadow-lg`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${analysis.color}`} />
            Emotion Pattern Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Primary Emotion</p>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {analysis.primaryEmotion}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Record Count</p>
                <p className="text-2xl font-bold text-gray-900">{recentEmotions.length}</p>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-lg p-4 border border-white/20">
              <p className="text-sm text-gray-700 leading-relaxed">
                {analysis.advice}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized recommendations */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            {personalizedAdvice.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personalizedAdvice.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Based on last 7 days analysis
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                View Detailed Analysis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 flex items-center justify-center gap-2 hover:bg-blue-50">
              <Heart className="w-4 h-4" />
              Start New Emotion Conversation
            </Button>
            <Button variant="outline" className="h-12 flex items-center justify-center gap-2 hover:bg-green-50">
              <Brain className="w-4 h-4" />
              Practice Mindfulness & Relaxation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
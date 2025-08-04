'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotionDatabase'
import { useAuthStore } from '@/store/auth'
import { 
  Trophy, 
  Heart, 
  Calendar, 
  Target, 
  Star, 
  Sparkles,
  TrendingUp,
  Brain,
  Users,
  Clock,
  Flame
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  condition: (records: any[]) => boolean
  color: string
  bgColor: string
  textColor: string
  progress?: (records: any[]) => { current: number; target: number }
}

export function AchievementBadge() {
  const { records, getRecentEmotions } = useEmotionStore()
  const { isLoggedIn } = useAuthStore()

  if (!isLoggedIn) {
    return null
  }

  const recentEmotions = getRecentEmotions(7)
  const totalRecords = records.length

  // Define achievements with enhanced criteria
  const achievements: Achievement[] = [
    {
      id: 'first-record',
      title: 'First Steps',
      description: 'Complete your first emotion record',
      icon: Heart,
      condition: (records) => records.length >= 1,
      color: '#ec4899',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      progress: (records) => ({ current: Math.min(records.length, 1), target: 1 })
    },
    {
      id: 'week-streak',
      title: 'Weekly Dedication',
      description: 'Record emotions for 7 consecutive days',
      icon: Calendar,
      condition: (records) => {
        // Check for 7 consecutive days with records
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toDateString()
        })
        return last7Days.every(dateStr => 
          records.some(record => new Date(record.timestamp).toDateString() === dateStr)
        )
      },
      color: '#3b82f6',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      progress: (records) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toDateString()
        })
        const daysWithRecords = last7Days.filter(dateStr => 
          records.some(record => new Date(record.timestamp).toDateString() === dateStr)
        ).length
        return { current: daysWithRecords, target: 7 }
      }
    },
    {
      id: 'emotion-explorer',
      title: 'Emotion Explorer',
      description: 'Experience 8 different types of emotions',
      icon: Brain,
      condition: (records) => {
        const uniqueEmotions = new Set(records.map(r => r.emotion))
        return uniqueEmotions.size >= 8
      },
      color: '#8b5cf6',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      progress: (records) => {
        const uniqueEmotions = new Set(records.map(r => r.emotion))
        return { current: uniqueEmotions.size, target: 8 }
      }
    },
    {
      id: 'conversation-master',
      title: 'Deep Thinker',
      description: 'Complete 10 high-intensity emotional records',
      icon: Target,
      condition: (records) => {
        const highIntensityRecords = records.filter(r => r.behavioralImpact >= 7)
        return highIntensityRecords.length >= 10
      },
      color: '#059669',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      progress: (records) => {
        const highIntensityRecords = records.filter(r => r.behavioralImpact >= 7)
        return { current: highIntensityRecords.length, target: 10 }
      }
    },
    {
      id: 'positive-momentum',
      title: 'Positive Momentum',
      description: 'Record 5 positive emotions in one week',
      icon: TrendingUp,
      condition: (records) => {
        const positiveEmotions = ['Joy', 'Love', 'Excitement', 'Pride', 'Gratitude', 'Hope', 'Contentment']
        const recentPositive = recentEmotions.filter(r => 
          positiveEmotions.includes(r.emotion)
        )
        return recentPositive.length >= 5
      },
      color: '#f59e0b',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      progress: (records) => {
        const positiveEmotions = ['Joy', 'Love', 'Excitement', 'Pride', 'Gratitude', 'Hope', 'Contentment']
        const recentPositive = recentEmotions.filter(r => 
          positiveEmotions.includes(r.emotion)
        )
        return { current: recentPositive.length, target: 5 }
      }
    },
    {
      id: 'consistent-tracker',
      title: 'Consistent Tracker',
      description: 'Complete 25 emotion records',
      icon: Clock,
      condition: (records) => records.length >= 25,
      color: '#06b6d4',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      progress: (records) => ({ current: records.length, target: 25 })
    },
    {
      id: 'emotion-master',
      title: 'Emotion Master',
      description: 'Complete 50 emotion records',
      icon: Trophy,
      condition: (records) => records.length >= 50,
      color: '#dc2626',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      progress: (records) => ({ current: records.length, target: 50 })
    },
    {
      id: 'wellness-champion',
      title: 'Wellness Champion',
      description: 'Experience all 21 emotion types',
      icon: Sparkles,
      condition: (records) => {
        const uniqueEmotions = new Set(records.map(r => r.emotion))
        return uniqueEmotions.size >= 21
      },
      color: '#7c3aed',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      progress: (records) => {
        const uniqueEmotions = new Set(records.map(r => r.emotion))
        return { current: uniqueEmotions.size, target: 21 }
      }
    }
  ]

  // Get unlocked and locked achievements
  const unlockedAchievements = achievements.filter(achievement => achievement.condition(records))
  const lockedAchievements = achievements.filter(achievement => !achievement.condition(records))

  if (totalRecords === 0) {
    return null // Don't show achievements when no records exist
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-orange-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          Achievement Badges
          <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-800">
            {unlockedAchievements.length}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Unlocked ({unlockedAchievements.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedAchievements.map((achievement) => {
                  const IconComponent = achievement.icon
                  return (
                    <div
                      key={achievement.id}
                      className={`${achievement.bgColor} rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm`}
                          style={{ backgroundColor: achievement.color }}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 text-sm">{achievement.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                        </div>
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* In Progress Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">In Progress ({lockedAchievements.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lockedAchievements.slice(0, 4).map((achievement) => {
                  const IconComponent = achievement.icon
                  const progress = achievement.progress?.(records)
                  const progressPercentage = progress ? Math.min((progress.current / progress.target) * 100, 100) : 0
                  
                  return (
                    <div
                      key={achievement.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-700 text-sm">{achievement.title}</h5>
                          <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                          {progress && (
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              {progress.current}/{progress.target}
                            </p>
                          )}
                        </div>
                      </div>
                      {progress && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-gray-400 to-gray-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white/60 rounded-xl p-4 border border-orange-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Progress</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{totalRecords}</div>
                <div className="text-xs text-gray-600">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{recentEmotions.length}</div>
                <div className="text-xs text-gray-600">This Week</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
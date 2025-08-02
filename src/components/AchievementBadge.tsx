import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotion'
import { 
  Trophy, 
  Heart, 
  Calendar, 
  Target, 
  Star, 
  Sparkles,
  TrendingUp,
  Brain
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  condition: (records: any[]) => boolean
  color: string
  bgColor: string
}

export function AchievementBadge() {
  const records = useEmotionStore((state) => state.records)
  const getRecentEmotions = useEmotionStore((state) => state.getRecentEmotions)

  const recentEmotions = getRecentEmotions(7)
  const totalRecords = records.length

  // 定义成就
  const achievements: Achievement[] = [
    {
      id: 'first-record',
      title: '初次记录',
      description: '完成第一次情绪记录',
      icon: Heart,
      condition: (records) => records.length >= 1,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'week-streak',
      title: '一周坚持',
      description: '连续记录7天',
      icon: Calendar,
      condition: (records) => recentEmotions.length >= 7,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'emotion-explorer',
      title: '情绪探索者',
      description: '体验过5种不同情绪',
      icon: Brain,
      condition: (records) => {
        const uniqueEmotions = new Set(records.map(r => r.emotionEvaluation?.actualEmotion || r.emotion))
        return uniqueEmotions.size >= 5
      },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'conversation-master',
      title: '对话大师',
      description: '完成10次深度对话',
      icon: Target,
      condition: (records) => {
        const deepConversations = records.filter(r => (r.emotionEvaluation?.actualIntensity || r.intensity) >= 7)
        return deepConversations.length >= 10
      },
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'positive-vibes',
      title: '积极向上',
      description: '连续3天保持积极情绪',
      icon: TrendingUp,
      condition: (records) => {
        const positiveEmotions = ['快乐', '惊讶']
        const recentPositive = recentEmotions.filter(r => 
          positiveEmotions.includes(r.emotionEvaluation?.actualEmotion || r.emotion)
        )
        return recentPositive.length >= 3
      },
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'emotion-guru',
      title: '情绪大师',
      description: '完成50次情绪记录',
      icon: Trophy,
      condition: (records) => records.length >= 50,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  // 获取已解锁的成就
  const unlockedAchievements = achievements.filter(achievement => achievement.condition(records))
  const lockedAchievements = achievements.filter(achievement => !achievement.condition(records))

  if (totalRecords === 0) {
    return null // 没有记录时不显示成就
  }

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          成就徽章
          <Badge variant="secondary" className="ml-auto">
            {unlockedAchievements.length}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 已解锁的成就 */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                已解锁 ({unlockedAchievements.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unlockedAchievements.map((achievement) => {
                  const IconComponent = achievement.icon
                  return (
                    <div
                      key={achievement.id}
                      className={`${achievement.bgColor} rounded-lg p-3 border border-white/50`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${achievement.color} bg-white rounded-full flex items-center justify-center`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 未解锁的成就 */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">待解锁 ({lockedAchievements.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lockedAchievements.slice(0, 4).map((achievement) => {
                  const IconComponent = achievement.icon
                  return (
                    <div
                      key={achievement.id}
                      className="bg-gray-100 rounded-lg p-3 border border-gray-200 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-500">{achievement.title}</h5>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 进度提示 */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">总记录数</span>
              <span className="font-medium text-gray-900">{totalRecords}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">本周记录</span>
              <span className="font-medium text-gray-900">{recentEmotions.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
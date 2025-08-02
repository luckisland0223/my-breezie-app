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

  // 获取最近7天的情绪记录
  const recentEmotions = getRecentEmotions(7)
  
  // 分析情绪模式
  const analyzeEmotionPattern = () => {
    if (recentEmotions.length === 0) {
      return {
        primaryEmotion: '快乐' as EmotionType,
        pattern: 'stable',
        advice: '开始记录你的情绪，了解自己的情感模式',
        icon: Sparkles,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    }

    // 统计情绪频率
    const emotionCounts: { [key: string]: number } = {}
    recentEmotions.forEach(record => {
      const emotion = record.emotionEvaluation?.actualEmotion || record.emotion
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
    })

    // 找出主要情绪
    const primaryEmotion = Object.entries(emotionCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as EmotionType
    
    // 分析情绪变化模式
    const positiveEmotions = ['快乐', '惊讶']
    const negativeEmotions = ['愤怒', '恐惧', '悲伤', '厌恶']
    
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
      advice = '你的情绪状态很好！继续保持积极的心态，多与朋友分享快乐时光'
      icon = TrendingUp
      color = 'text-green-600'
      bgColor = 'bg-green-50'
    } else if (negativeCount > positiveCount && negativeCount >= 3) {
      pattern = 'negative'
      advice = '最近情绪有些低落，建议多进行户外活动，与亲友交流，必要时寻求专业帮助'
      icon = TrendingDown
      color = 'text-red-600'
      bgColor = 'bg-red-50'
    } else {
      pattern = 'mixed'
      advice = '情绪有起伏是正常的，建议保持规律的作息，练习冥想或深呼吸来稳定情绪'
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

  // 生成个性化建议
  const getPersonalizedAdvice = () => {
    const { primaryEmotion, pattern } = analysis
    
      const adviceMap = {
    '愤怒': {
      title: '愤怒管理建议',
      tips: [
        '深呼吸练习：吸气4秒，屏气4秒，呼气6秒',
        '暂时离开引发愤怒的环境',
        '写下你的感受，帮助理清思路',
        '进行体育锻炼释放压力'
      ]
    },
    '厌恶': {
      title: '情绪调节建议',
      tips: [
        '识别引发厌恶的具体原因',
        '尝试改变环境或视角',
        '练习接纳不完美的事物',
        '寻找积极的一面'
      ]
    },
    '恐惧': {
      title: '缓解焦虑建议',
      tips: [
        '练习渐进式肌肉放松',
        '制定具体的目标和计划',
        '限制咖啡因和酒精摄入',
        '寻求专业心理咨询师的帮助'
      ]
    },
    '快乐': {
      title: '保持积极心态',
      tips: [
        '记录生活中的美好时刻',
        '与朋友分享你的快乐',
        '尝试帮助他人，传递正能量',
        '保持感恩的心态'
      ]
    },
    '悲伤': {
      title: '情绪调节建议',
      tips: [
        '允许自己感受悲伤，不要压抑情绪',
        '与信任的朋友或家人倾诉',
        '尝试新的兴趣爱好转移注意力',
        '保持规律的作息和健康饮食'
      ]
    },
    '惊讶': {
      title: '处理意外情绪',
      tips: [
        '给自己时间消化新信息',
        '保持开放和好奇的心态',
        '与朋友分享你的发现',
        '将惊讶转化为学习机会'
      ]
    },
    '复杂': {
      title: '情绪梳理建议',
      tips: [
        '花时间独处，反思自己的感受',
        '写日记记录情绪变化',
        '尝试冥想或正念练习',
        '与专业人士讨论复杂情绪'
      ]
    }
  }

    return adviceMap[primaryEmotion] || adviceMap['复杂']
  }

  const personalizedAdvice = getPersonalizedAdvice()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 情绪模式分析 */}
      <Card className={`${analysis.bgColor} border-0 shadow-lg`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${analysis.color}`} />
            情绪模式分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">主要情绪</p>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {analysis.primaryEmotion}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">记录数量</p>
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

      {/* 个性化建议 */}
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
                基于最近7天数据分析
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                查看详细分析
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速行动 */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            快速行动
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 flex items-center justify-center gap-2 hover:bg-blue-50">
              <Heart className="w-4 h-4" />
              开始新的情绪对话
            </Button>
            <Button variant="outline" className="h-12 flex items-center justify-center gap-2 hover:bg-green-50">
              <Brain className="w-4 h-4" />
              练习冥想放松
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
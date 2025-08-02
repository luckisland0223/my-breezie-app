import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { 
  Angry, 
  Meh, 
  AlertTriangle, 
  Smile, 
  Frown, 
  Zap,
  Brain,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const emotionConfig = {
  '愤怒': {
    icon: Angry,
    color: 'bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 border-red-300',
    textColor: 'text-red-800',
    description: '感到愤怒和不满',
    gradient: 'from-red-400 to-red-600'
  },
  '厌恶': {
    icon: Meh,
    color: 'bg-gradient-to-br from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 border-orange-300',
    textColor: 'text-orange-800',
    description: '感到厌恶和反感',
    gradient: 'from-orange-400 to-orange-600'
  },
  '恐惧': {
    icon: AlertTriangle,
    color: 'bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 border-purple-300',
    textColor: 'text-purple-800',
    description: '感到恐惧和害怕',
    gradient: 'from-purple-400 to-purple-600'
  },
  '快乐': {
    icon: Smile,
    color: 'bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 border-green-300',
    textColor: 'text-green-800',
    description: '感到快乐和满足',
    gradient: 'from-green-400 to-green-600'
  },
  '悲伤': {
    icon: Frown,
    color: 'bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-blue-300',
    textColor: 'text-blue-800',
    description: '感到悲伤和难过',
    gradient: 'from-blue-400 to-blue-600'
  },
  '惊讶': {
    icon: Zap,
    color: 'bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 border-yellow-300',
    textColor: 'text-yellow-800',
    description: '感到惊讶和意外',
    gradient: 'from-yellow-400 to-yellow-600'
  },
  '复杂': {
    icon: Brain,
    color: 'bg-gradient-to-br from-indigo-100 to-indigo-200 hover:from-indigo-200 hover:to-indigo-300 border-indigo-300',
    textColor: 'text-indigo-800',
    description: '焦虑、嫉妒、尴尬等复杂情绪',
    gradient: 'from-indigo-400 to-indigo-600'
  }
}

interface EmotionSelectorProps {
  onEmotionSelect: (emotion: EmotionType) => void
}

export function EmotionSelector({ onEmotionSelect }: EmotionSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h2 className="text-3xl font-bold text-gray-900">你现在感觉如何？</h2>
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <p className="text-gray-600 text-lg">选择一个最符合你当前情绪的状态，Breezie会陪伴你度过这个时刻</p>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 第一排：3个主要情绪 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
          {(Object.keys(emotionConfig) as EmotionType[]).slice(0, 3).map((emotion) => {
            const config = emotionConfig[emotion]
            const IconComponent = config.icon
            
            return (
              <Card 
                key={emotion}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${config.color} border-2 w-full max-w-sm group`}
                onClick={() => onEmotionSelect(emotion)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className={`text-xl font-bold ${config.textColor} group-hover:scale-105 transition-transform duration-300`}>
                    {emotion}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0 pb-6">
                  <p className={`text-sm ${config.textColor} opacity-80 mb-4 leading-relaxed`}>
                    {config.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`${config.textColor} hover:bg-white/30 transition-all duration-300 group-hover:translate-x-1`}
                  >
                    开始对话
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* 第二排：4个情绪 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
          {(Object.keys(emotionConfig) as EmotionType[]).slice(3).map((emotion) => {
            const config = emotionConfig[emotion]
            const IconComponent = config.icon
            
            return (
              <Card 
                key={emotion}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${config.color} border-2 w-full max-w-xs group`}
                onClick={() => onEmotionSelect(emotion)}
              >
                <CardHeader className="text-center pb-3">
                  <div className="flex justify-center mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className={`text-lg font-semibold ${config.textColor} group-hover:scale-105 transition-transform duration-300`}>
                    {emotion}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0 pb-4">
                  <p className={`text-sm ${config.textColor} opacity-80 mb-3 leading-relaxed`}>
                    {config.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`${config.textColor} hover:bg-white/30 transition-all duration-300 group-hover:translate-x-1 text-xs`}
                  >
                    开始对话
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-700">选择一个情绪开始你的对话之旅</span>
        </div>
      </div>
    </div>
  )
} 
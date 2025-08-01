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
  ArrowRight
} from 'lucide-react'

const emotionConfig = {
  '愤怒': {
    icon: Angry,
    color: 'bg-red-100 hover:bg-red-200 border-red-300',
    textColor: 'text-red-800',
    description: '感到愤怒和不满'
  },
  '厌恶': {
    icon: Meh,
    color: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
    textColor: 'text-orange-800',
    description: '感到厌恶和反感'
  },
  '恐惧': {
    icon: AlertTriangle,
    color: 'bg-purple-100 hover:bg-purple-200 border-purple-300',
    textColor: 'text-purple-800',
    description: '感到恐惧和害怕'
  },
  '快乐': {
    icon: Smile,
    color: 'bg-green-100 hover:bg-green-200 border-green-300',
    textColor: 'text-green-800',
    description: '感到快乐和满足'
  },
  '悲伤': {
    icon: Frown,
    color: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
    textColor: 'text-blue-800',
    description: '感到悲伤和难过'
  },
  '惊讶': {
    icon: Zap,
    color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
    textColor: 'text-yellow-800',
    description: '感到惊讶和意外'
  },
  '复杂': {
    icon: Brain,
    color: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300',
    textColor: 'text-indigo-800',
    description: '焦虑、嫉妒、尴尬等复杂情绪'
  }
}

interface EmotionSelectorProps {
  onEmotionSelect: (emotion: EmotionType) => void
}

export function EmotionSelector({ onEmotionSelect }: EmotionSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">你现在感觉如何？</h2>
        <p className="text-gray-600">选择一个最符合你当前情绪的状态，Breezie会陪伴你</p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 第一排：3个按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center">
          {(Object.keys(emotionConfig) as EmotionType[]).slice(0, 3).map((emotion) => {
            const config = emotionConfig[emotion]
            const IconComponent = config.icon
            
            return (
              <Card 
                key={emotion}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${config.color} border-2 w-full max-w-xs`}
                onClick={() => onEmotionSelect(emotion)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`w-8 h-8 ${config.textColor}`} />
                  </div>
                  <CardTitle className={`text-lg font-semibold ${config.textColor}`}>
                    {emotion}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className={`text-sm ${config.textColor} opacity-80`}>
                    {config.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`mt-3 ${config.textColor} hover:bg-white/20`}
                  >
                    开始对话
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* 第二排：4个按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
          {(Object.keys(emotionConfig) as EmotionType[]).slice(3).map((emotion) => {
            const config = emotionConfig[emotion]
            const IconComponent = config.icon
            
            return (
              <Card 
                key={emotion}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${config.color} border-2 w-full max-w-xs`}
                onClick={() => onEmotionSelect(emotion)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`w-8 h-8 ${config.textColor}`} />
                  </div>
                  <CardTitle className={`text-lg font-semibold ${config.textColor}`}>
                    {emotion}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className={`text-sm ${config.textColor} opacity-80`}>
                    {config.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`mt-3 ${config.textColor} hover:bg-white/20`}
                  >
                    开始对话
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
} 
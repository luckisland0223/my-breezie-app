import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import type { EmotionType, BehavioralImpactAnalysis } from '@/store/emotion'

interface BehavioralImpactDisplayProps {
  emotion: EmotionType
  impactAnalysis: BehavioralImpactAnalysis
}

export function BehavioralImpactDisplay({ emotion, impactAnalysis }: BehavioralImpactDisplayProps) {
  const getImpactIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          行为影响分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总体影响评分 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getImpactIcon(impactAnalysis.impactLevel)}
            <span className="font-medium">总体影响程度</span>
          </div>
          <Badge className={getImpactColor(impactAnalysis.impactLevel)}>
            {impactAnalysis.impactScore}/10
          </Badge>
        </div>

        {/* 具体影响维度 */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">具体影响维度</h4>
          
          {/* 决策影响 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm">决策影响</span>
              </div>
              <span className="text-sm font-medium">{impactAnalysis.decisionInfluence}/10</span>
            </div>
            <Progress value={impactAnalysis.decisionInfluence * 10} className="h-2" />
          </div>

          {/* 社交互动影响 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm">社交互动</span>
              </div>
              <span className="text-sm font-medium">{impactAnalysis.socialInteraction}/10</span>
            </div>
            <Progress value={impactAnalysis.socialInteraction * 10} className="h-2" />
          </div>

          {/* 工作效率影响 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm">工作效率</span>
              </div>
              <span className="text-sm font-medium">{impactAnalysis.productivity}/10</span>
            </div>
            <Progress value={impactAnalysis.productivity * 10} className="h-2" />
          </div>
        </div>

        {/* 行为变化描述 */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">预期行为变化</h4>
          <div className="space-y-1">
            {impactAnalysis.behaviorChanges.map((change, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 建议 */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-2">💡 建议</h4>
          <p className="text-sm text-blue-700">
            {impactAnalysis.impactLevel === 'high' 
              ? '情绪对行为影响较大，建议适当调整和关注。'
              : impactAnalysis.impactLevel === 'medium'
              ? '情绪对行为有一定影响，保持关注即可。'
              : '情绪对行为影响较小，继续保持良好状态。'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 
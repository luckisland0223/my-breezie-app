import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { BehavioralImpactAnalysis, EmotionType } from '@/store/emotion'
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Target, 
  TrendingDown, 
  TrendingUp, 
  Users 
} from 'lucide-react'
import React from 'react'

interface BehavioralImpactDisplayProps {
  emotion: EmotionType
  impactAnalysis: BehavioralImpactAnalysis
}

export function BehavioralImpactDisplay({ emotion, impactAnalysis }: BehavioralImpactDisplayProps) {
  const getImpactIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
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
          <Activity className="h-5 w-5" />
          Behavioral Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Impact Score */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            {getImpactIcon(impactAnalysis.impactLevel)}
            <span className="font-medium">Overall Impact Level</span>
          </div>
          <Badge className={getImpactColor(impactAnalysis.impactLevel)}>
            {impactAnalysis.impactScore}/10
          </Badge>
        </div>

        {/* Specific Impact Dimensions */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 text-sm">Specific Impact Dimensions</h4>
          
          {/* Decision Making Impact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Decision Making</span>
              </div>
              <span className="font-medium text-sm">{impactAnalysis.decisionInfluence}/10</span>
            </div>
            <Progress value={impactAnalysis.decisionInfluence * 10} className="h-2" />
          </div>

          {/* Social Interaction Impact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm">Social Interaction</span>
              </div>
              <span className="font-medium text-sm">{impactAnalysis.socialInteraction}/10</span>
            </div>
            <Progress value={impactAnalysis.socialInteraction * 10} className="h-2" />
          </div>

          {/* Work Productivity Impact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Work Productivity</span>
              </div>
              <span className="font-medium text-sm">{impactAnalysis.productivity}/10</span>
            </div>
            <Progress value={impactAnalysis.productivity * 10} className="h-2" />
          </div>
        </div>

        {/* Behavioral Change Description */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 text-sm">Expected Behavioral Changes</h4>
          <div className="space-y-1">
            {impactAnalysis.behaviorChanges.map((change, index) => (
              <div key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <h4 className="mb-2 font-medium text-blue-800 text-sm">💡 Recommendations</h4>
          <p className="text-blue-700 text-sm">
            {impactAnalysis.impactLevel === 'high' 
              ? 'Emotions have a significant impact on behavior. Consider appropriate adjustments and attention.'
              : impactAnalysis.impactLevel === 'medium'
              ? 'Emotions have some impact on behavior. Maintain awareness as needed.'
              : 'Emotions have minimal impact on behavior. Continue maintaining good condition.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 
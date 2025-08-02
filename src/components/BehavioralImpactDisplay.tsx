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
          Behavioral Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Impact Score */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
          <h4 className="font-medium text-sm text-gray-700">Specific Impact Dimensions</h4>
          
          {/* Decision Making Impact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Decision Making</span>
              </div>
              <span className="text-sm font-medium">{impactAnalysis.decisionInfluence}/10</span>
            </div>
            <Progress value={impactAnalysis.decisionInfluence * 10} className="h-2" />
          </div>

          {/* Social Interaction Impact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm">Social Interaction</span>
              </div>
              <span className="text-sm font-medium">{impactAnalysis.socialInteraction}/10</span>
            </div>
            <Progress value={impactAnalysis.socialInteraction * 10} className="h-2" />
          </div>

          {/* Work Productivity Impact */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Work Productivity</span>
              </div>
              <span className="text-sm font-medium">{impactAnalysis.productivity}/10</span>
            </div>
            <Progress value={impactAnalysis.productivity * 10} className="h-2" />
          </div>
        </div>

        {/* Behavioral Change Description */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Expected Behavioral Changes</h4>
          <div className="space-y-1">
            {impactAnalysis.behaviorChanges.map((change, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm text-blue-800 mb-2">💡 Recommendations</h4>
          <p className="text-sm text-blue-700">
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
import type { EmotionType } from '@/store/emotion'

// Behavioral Impact Score Algorithm
// Based on Cognitive Appraisal Theory of Emotion

export interface EmotionalIntensity {
  intensity: number // 1-10 scale
  level: 'low' | 'medium' | 'high' // Categorized level
}

export interface EmotionalFocus {
  type: 'internal' | 'external' | 'mixed'
  score: number // 1-10, higher = more focused
  description: string
}

export interface CognitiveAppraisal {
  controllability: number // 1-10, higher = more controllable
  threat_vs_challenge: number // 1-10, higher = more challenge than threat
  coping_potential: number // 1-10, higher = better coping ability
  goal_relevance: number // 1-10, higher = more relevant to goals
}

export interface BehavioralImpactScore {
  overall_score: number // 1-10, final behavioral impact score
  intensity: EmotionalIntensity
  focus: EmotionalFocus
  appraisal: CognitiveAppraisal
  action_tendency: string // Predicted behavioral tendency
  risk_level: 'low' | 'medium' | 'high'
  recommendations: string[]
}

// Emotion baseline behavioral tendencies
const emotionBaselines: Record<EmotionType, {
  baseline_score: number
  action_tendency: string
  controllability_modifier: number
  threat_modifier: number
}> = {
  'Anger': {
    baseline_score: 7.5,
    action_tendency: 'Confrontation or withdrawal',
    controllability_modifier: 0.8, // Lower perceived control
    threat_modifier: 0.2 // High threat perception
  },
  'Fear': {
    baseline_score: 8.0,
    action_tendency: 'Avoidance or seeking safety',
    controllability_modifier: 0.3, // Very low perceived control
    threat_modifier: 0.1 // Very high threat perception
  },
  'Sadness': {
    baseline_score: 6.5,
    action_tendency: 'Withdrawal or seeking support',
    controllability_modifier: 0.4, // Low perceived control
    threat_modifier: 0.6 // Moderate threat perception
  },
  'Anxiety': {
    baseline_score: 7.8,
    action_tendency: 'Hypervigilance or avoidance',
    controllability_modifier: 0.3, // Very low perceived control
    threat_modifier: 0.2 // High threat perception
  },
  'Joy': {
    baseline_score: 3.2,
    action_tendency: 'Approach and engagement',
    controllability_modifier: 1.2, // High perceived control
    threat_modifier: 0.9 // Low threat perception
  },
  'Love': {
    baseline_score: 4.0,
    action_tendency: 'Bonding and care-giving',
    controllability_modifier: 1.0, // Moderate control
    threat_modifier: 0.8 // Low threat perception
  },
  'Pride': {
    baseline_score: 3.5,
    action_tendency: 'Self-enhancement and sharing',
    controllability_modifier: 1.3, // High control
    threat_modifier: 0.9 // Low threat
  },
  'Shame': {
    baseline_score: 7.2,
    action_tendency: 'Hiding or self-criticism',
    controllability_modifier: 0.2, // Very low control
    threat_modifier: 0.3 // High threat to self-image
  },
  'Guilt': {
    baseline_score: 6.8,
    action_tendency: 'Repair or self-punishment',
    controllability_modifier: 0.6, // Moderate-low control
    threat_modifier: 0.4 // Moderate threat
  },
  'Envy': {
    baseline_score: 6.0,
    action_tendency: 'Comparison or competition',
    controllability_modifier: 0.5, // Low-moderate control
    threat_modifier: 0.4 // Moderate threat to self-worth
  },
  'Hope': {
    baseline_score: 4.2,
    action_tendency: 'Goal pursuit and planning',
    controllability_modifier: 1.1, // High control belief
    threat_modifier: 0.7 // Low-moderate threat
  },
  'Excitement': {
    baseline_score: 5.5,
    action_tendency: 'High energy engagement',
    controllability_modifier: 1.2, // High control
    threat_modifier: 0.8 // Low threat
  },
  'Frustration': {
    baseline_score: 7.0,
    action_tendency: 'Persistent effort or giving up',
    controllability_modifier: 0.6, // Moderate control
    threat_modifier: 0.5 // Moderate threat
  },
  'Contentment': {
    baseline_score: 2.5,
    action_tendency: 'Maintenance and savoring',
    controllability_modifier: 1.1, // High control
    threat_modifier: 0.9 // Very low threat
  },
  'Loneliness': {
    baseline_score: 6.2,
    action_tendency: 'Seeking connection or isolation',
    controllability_modifier: 0.4, // Low control
    threat_modifier: 0.6 // Moderate threat
  },
  'Boredom': {
    baseline_score: 4.8,
    action_tendency: 'Seeking stimulation or disengagement',
    controllability_modifier: 0.8, // Moderate control
    threat_modifier: 0.8 // Low threat
  },
  'Confusion': {
    baseline_score: 5.2,
    action_tendency: 'Information seeking or uncertainty tolerance',
    controllability_modifier: 0.5, // Low-moderate control
    threat_modifier: 0.6 // Moderate threat
  },
  'Gratitude': {
    baseline_score: 3.0,
    action_tendency: 'Reciprocity and appreciation',
    controllability_modifier: 1.0, // Moderate control
    threat_modifier: 0.9 // Very low threat
  },
  'Surprise': {
    baseline_score: 5.0,
    action_tendency: 'Attention focus and evaluation',
    controllability_modifier: 0.7, // Moderate control
    threat_modifier: 0.5 // Neutral threat
  },
  'Disgust': {
    baseline_score: 6.5,
    action_tendency: 'Avoidance and rejection',
    controllability_modifier: 0.8, // Moderate control
    threat_modifier: 0.3 // High threat to values
  },
  'Other': {
    baseline_score: 5.0,
    action_tendency: 'Variable response patterns',
    controllability_modifier: 0.7, // Moderate control
    threat_modifier: 0.5 // Neutral threat
  }
}

// Analyze text for emotional focus
export function analyzeEmotionalFocus(text: string): EmotionalFocus {
  const internalIndicators = [
    'I feel', 'I am', 'I think', 'I believe', 'I should', 'I need', 'my fault', 'I failed', 'I can\'t'
  ]
  const externalIndicators = [
    'they did', 'he said', 'she made', 'it caused', 'because of', 'due to', 'others', 'people'
  ]
  
  const internalCount = internalIndicators.reduce((count, indicator) => 
    count + (text.toLowerCase().includes(indicator.toLowerCase()) ? 1 : 0), 0)
  const externalCount = externalIndicators.reduce((count, indicator) => 
    count + (text.toLowerCase().includes(indicator.toLowerCase()) ? 1 : 0), 0)
  
  const total = internalCount + externalCount
  if (total === 0) {
    return {
      type: 'mixed',
      score: 5,
      description: 'Emotional focus unclear from available text'
    }
  }
  
  const internalRatio = internalCount / total
  
  if (internalRatio > 0.7) {
    return {
      type: 'internal',
      score: Math.min(10, internalCount * 2 + 3),
      description: 'Focus on internal thoughts, feelings, and self-evaluation'
    }
  } else if (internalRatio < 0.3) {
    return {
      type: 'external',
      score: Math.min(10, externalCount * 2 + 3),
      description: 'Focus on external events, people, and circumstances'
    }
  } else {
    return {
      type: 'mixed',
      score: Math.min(10, total + 2),
      description: 'Mixed focus on both internal and external factors'
    }
  }
}

// Analyze text for cognitive appraisal
export function analyzeCognitiveAppraisal(text: string, emotion: EmotionType): CognitiveAppraisal {
  const controllabilityIndicators = {
    high: ['I can', 'I will', 'I choose', 'I decide', 'manageable', 'handle', 'control'],
    low: ['I can\'t', 'hopeless', 'stuck', 'trapped', 'overwhelming', 'impossible', 'helpless']
  }
  
  const challengeIndicators = ['opportunity', 'learn', 'grow', 'challenge', 'overcome', 'achieve']
  const threatIndicators = ['dangerous', 'scary', 'threatening', 'harmful', 'worried', 'afraid']
  
  const copingIndicators = {
    high: ['support', 'help', 'resources', 'strategy', 'plan', 'cope', 'manage'],
    low: ['alone', 'no one', 'no help', 'don\'t know', 'lost', 'confused']
  }
  
  const goalIndicators = ['important', 'matters', 'care about', 'goal', 'dream', 'want', 'need']
  
  const baseline = emotionBaselines[emotion]
  
  // Calculate controllability
  const highControl = controllabilityIndicators.high.reduce((count, word) => 
    count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0)
  const lowControl = controllabilityIndicators.low.reduce((count, word) => 
    count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0)
  const controlScore = Math.max(1, Math.min(10, 
    5 + (highControl - lowControl) * baseline.controllability_modifier))
  
  // Calculate threat vs challenge
  const challengeCount = challengeIndicators.reduce((count, word) => 
    count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0)
  const threatCount = threatIndicators.reduce((count, word) => 
    count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0)
  const threatChallengeScore = Math.max(1, Math.min(10, 
    5 + (challengeCount - threatCount) * baseline.threat_modifier))
  
  // Calculate coping potential
  const highCoping = copingIndicators.high.reduce((count, word) => 
    count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0)
  const lowCoping = copingIndicators.low.reduce((count, word) => 
    count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0)
  const copingScore = Math.max(1, Math.min(10, 5 + (highCoping - lowCoping)))
  
  // Calculate goal relevance
  const goalScore = Math.max(1, Math.min(10, 3 + goalIndicators.reduce((count, word) => 
    count + (text.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0)))
  
  return {
    controllability: Math.round(controlScore * 10) / 10,
    threat_vs_challenge: Math.round(threatChallengeScore * 10) / 10,
    coping_potential: Math.round(copingScore * 10) / 10,
    goal_relevance: Math.round(goalScore * 10) / 10
  }
}

// Calculate behavioral impact score
export function calculateBehavioralImpactScore(
  emotion: EmotionType,
  intensity: number,
  conversationText = ''
): BehavioralImpactScore {
  
  const baseline = emotionBaselines[emotion]
  
  // Analyze emotional intensity
  const emotionalIntensity: EmotionalIntensity = {
    intensity,
    level: intensity <= 3 ? 'low' : intensity <= 7 ? 'medium' : 'high'
  }
  
  // Analyze emotional focus
  const focus = analyzeEmotionalFocus(conversationText)
  
  // Analyze cognitive appraisal
  const appraisal = analyzeCognitiveAppraisal(conversationText, emotion)
  
  // Calculate overall behavioral impact score
  const intensityWeight = 0.35
  const appraisalWeight = 0.45
  const focusWeight = 0.20
  
  const intensityComponent = (intensity / 10) * intensityWeight * 10
  const appraisalComponent = (
    (10 - appraisal.controllability) * 0.4 +
    (10 - appraisal.threat_vs_challenge) * 0.3 +
    (10 - appraisal.coping_potential) * 0.2 +
    appraisal.goal_relevance * 0.1
  ) * appraisalWeight
  const focusComponent = (focus.score / 10) * focusWeight * 10
  
  const baselineScore = baseline.baseline_score
  const rawScore = (intensityComponent + appraisalComponent + focusComponent + baselineScore) / 4
  const overall_score = Math.max(1, Math.min(10, Math.round(rawScore * 10) / 10))
  
  // Determine risk level
  const risk_level: 'low' | 'medium' | 'high' = 
    overall_score <= 3 ? 'low' : overall_score <= 7 ? 'medium' : 'high'
  
  // Generate recommendations
  const recommendations = generateRecommendations(emotion, overall_score, appraisal, focus)
  
  return {
    overall_score,
    intensity: emotionalIntensity,
    focus,
    appraisal,
    action_tendency: baseline.action_tendency,
    risk_level,
    recommendations
  }
}

// Generate personalized recommendations
function generateRecommendations(
  emotion: EmotionType,
  score: number,
  appraisal: CognitiveAppraisal,
  focus: EmotionalFocus
): string[] {
  const recommendations: string[] = []
  
  // High behavioral impact recommendations
  if (score >= 7) {
    recommendations.push('Consider taking a break before making any major decisions')
    
    if (appraisal.controllability < 5) {
      recommendations.push('Focus on what you can control, even if it\'s small steps')
    }
    
    if (appraisal.coping_potential < 5) {
      recommendations.push('Reach out to friends, family, or professionals for support')
    }
    
    if (focus.type === 'internal') {
      recommendations.push('Practice self-compassion and avoid harsh self-judgment')
    }
  }
  
  // Medium behavioral impact recommendations
  if (score >= 4 && score < 7) {
    recommendations.push('Use this emotional energy constructively for positive change')
    
    if (appraisal.threat_vs_challenge < 5) {
      recommendations.push('Try reframing this situation as a challenge rather than a threat')
    }
  }
  
  // Low behavioral impact recommendations
  if (score < 4) {
    recommendations.push('This is a good time for reflection and planning')
    recommendations.push('Consider what you can learn from this emotional experience')
  }
  
  // Emotion-specific recommendations
  switch (emotion) {
    case 'Anger':
      recommendations.push('Try deep breathing or physical exercise to channel this energy')
      break
    case 'Anxiety':
      recommendations.push('Practice grounding techniques like 5-4-3-2-1 sensory awareness')
      break
    case 'Sadness':
      recommendations.push('Allow yourself to feel this emotion - it\'s part of healing')
      break
    case 'Joy':
      recommendations.push('Share this positive feeling with others or savor the moment')
      break
  }
  
  return recommendations.slice(0, 3) // Return top 3 recommendations
}
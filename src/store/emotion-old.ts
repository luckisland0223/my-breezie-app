import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dbService } from '@/lib/services/database'

export type EmotionType = 'Anger' | 'Disgust' | 'Fear' | 'Joy' | 'Sadness' | 'Surprise' | 'Complex'
export type PolarityType = 'positive' | 'negative' | 'neutral'

export interface EmotionPolarityAnalysis {
  polarity: PolarityType // Emotion polarity: positive/negative/neutral
  strength: number // Actual emotion intensity (1-10)
  confidence: number // Polarity assessment confidence (1-10)
}

export interface EmotionEvaluation {
  actualEmotion: EmotionType // AI-analyzed actual emotion
  actualIntensity: number // AI-assessed actual intensity (1-10)
  emotionChanged: boolean // Whether emotion differs from initial
  confidenceLevel: number // AI assessment confidence (1-10)
  analysis: string // Emotion analysis explanation
}

export interface ConversationSummary {
  userProblem: string // User's identified problem
  solution: string // Provided solution or guidance
  userReaction: string // User's final response
}

export interface EmotionRecord {
  id: string
  emotion: EmotionType // User's initially selected emotion
  behavioralImpact: number // Emotion's impact on behavior (1-10)
  note: string
  timestamp: Date
  conversationSummary?: ConversationSummary // Conversation summary (optional)
  emotionEvaluation?: EmotionEvaluation // AI emotion assessment (optional)
  polarityAnalysis?: EmotionPolarityAnalysis // Emotion polarity analysis (enhanced)
}

// Enhanced: Emotion behavioral impact assessment algorithm
export interface BehavioralImpactAnalysis {
  impactLevel: 'low' | 'medium' | 'high' // Impact level
  impactScore: number // Impact score (1-10)
  behaviorChanges: string[] // Specific behavioral changes
  decisionInfluence: number // Decision-making influence (1-10)
  socialInteraction: number // Social interaction impact (1-10)
  productivity: number // Work/productivity impact (1-10)
}

// Function to calculate emotional impact on behavior
export function calculateBehavioralImpact(
  emotion: EmotionType, 
  intensity: number, 
  context: string
): BehavioralImpactAnalysis {
  
  // Base impact score (based on emotion type and intensity)
  const baseImpact = intensity * getEmotionImpactMultiplier(emotion)
  
  // Adjust impact based on emotion type
  const impactAdjustments = {
    'Anger': { decision: 1.2, social: 0.8, productivity: 0.6 },
    'Disgust': { decision: 0.8, social: 0.6, productivity: 0.7 },
    'Fear': { decision: 1.1, social: 0.9, productivity: 0.8 },
    'Joy': { decision: 0.9, social: 1.2, productivity: 1.1 },
    'Sadness': { decision: 0.7, social: 0.8, productivity: 0.6 },
    'Surprise': { decision: 1.0, social: 1.0, productivity: 0.9 },
    'Complex': { decision: 1.1, social: 0.9, productivity: 0.8 }
  }
  
  const adjustment = impactAdjustments[emotion]
  
  return {
    impactLevel: baseImpact <= 3 ? 'low' : baseImpact <= 7 ? 'medium' : 'high',
    impactScore: Math.min(10, Math.round(baseImpact)),
    behaviorChanges: getBehaviorChanges(emotion, intensity),
    decisionInfluence: Math.min(10, Math.round(intensity * adjustment.decision)),
    socialInteraction: Math.min(10, Math.round(intensity * adjustment.social)),
    productivity: Math.min(10, Math.round(intensity * adjustment.productivity))
  }
}

// Get emotion impact multiplier
function getEmotionImpactMultiplier(emotion: EmotionType): number {
  const multipliers = {
    'Anger': 1.3,    // Anger has high behavioral impact
    'Disgust': 0.8,  // Disgust has relatively low impact
    'Fear': 1.2,     // Fear has high impact
    'Joy': 0.9,      // Joy has moderate impact
    'Sadness': 1.1,  // Sadness has high impact
    'Surprise': 1.0, // Surprise has medium impact
    'Complex': 1.2   // Complex emotions have high impact
  }
  return multipliers[emotion]
}

// Get specific behavioral change descriptions
function getBehaviorChanges(emotion: EmotionType, intensity: number): string[] {
  const changes: string[] = []
  
  if (intensity >= 7) {
    // High intensity impact
    switch (emotion) {
      case 'Anger':
        changes.push('May impair decision-making', 'Reduced social interaction', 'Decreased work efficiency')
        break
      case 'Fear':
        changes.push('More cautious decision-making', 'Social avoidance tendencies', 'Scattered attention')
        break
      case 'Sadness':
        changes.push('Reduced decision positivity', 'Decreased social motivation', 'Lower work drive')
        break
      case 'Joy':
        changes.push('More positive decision-making', 'Increased social interaction', 'Enhanced work efficiency')
        break
      case 'Complex':
        changes.push('Complicated decision processes', 'Unstable social performance', 'Fluctuating work efficiency')
        break
      case 'Disgust':
        changes.push('Avoidance behaviors', 'Selective social engagement', 'Task avoidance patterns')
        break
      case 'Surprise':
        changes.push('Temporary decision disruption', 'Heightened attention', 'Variable performance')
        break
    }
  } else if (intensity >= 4) {
    // Medium intensity impact
    changes.push('Moderate behavioral influence', 'Some adjustments needed')
  } else {
    // Low intensity impact
    changes.push('Minimal behavioral impact', 'Generally maintaining normal state')
  }
  
  return changes
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface ChatSession {
  id: string
  emotion: EmotionType
  messages: ChatMessage[]
  startTime: Date
  endTime?: Date
}

export interface EmotionStats {
  [key: string]: {
    count: number
    avgIntensity: number
    totalIntensity: number
    lastRecorded?: Date
  }
}

interface EmotionState {
  // Core data
  records: EmotionRecord[]
  stats: EmotionStats
  currentSession: ChatSession | null
  
  // Actions
  addEmotionRecord: (emotion: EmotionType, intensity: number, note: string, conversationSummary?: ConversationSummary, emotionEvaluation?: EmotionEvaluation, polarityAnalysis?: EmotionPolarityAnalysis) => void
  getRecordsByEmotion: (emotion: EmotionType) => EmotionRecord[]
  getRecordsByDateRange: (startDate: Date, endDate: Date) => EmotionRecord[]
  getEmotionStats: () => EmotionStats
  getRecentEmotions: (days: number) => EmotionRecord[]
  clearAllRecords: () => void
  deleteRecord: (recordId: string) => void
  
  // Chat actions
  startChatSession: (emotion: EmotionType) => void
  endChatSession: () => void
  addMessage: (content: string, role: 'user' | 'assistant') => void
}

// Initialize statistics data
const createInitialStats = (): EmotionStats => ({
  'Anger': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  'Disgust': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  'Fear': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  'Joy': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  'Sadness': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  'Surprise': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  'Complex': { count: 0, avgIntensity: 0, totalIntensity: 0 },
})

// Recalculate statistics (from records to ensure data consistency)
// Prioritize AI-assessed actual emotion and intensity, fallback to user's initial choice
const recalculateStats = (records: EmotionRecord[]): EmotionStats => {
  const stats = createInitialStats()
  
  records.forEach(record => {
    // Use AI-assessed emotion and intensity (if available), otherwise use user's initial choice
    const actualEmotion = record.emotionEvaluation?.actualEmotion || record.emotion
    const actualIntensity = record.emotionEvaluation?.actualIntensity || record.behavioralImpact
    
    const emotionStat = stats[actualEmotion]
    if (emotionStat) {
      emotionStat.count += 1
      emotionStat.totalIntensity += actualIntensity
      emotionStat.avgIntensity = Math.round((emotionStat.totalIntensity / emotionStat.count) * 10) / 10
      
      if (!emotionStat.lastRecorded || record.timestamp > emotionStat.lastRecorded) {
        emotionStat.lastRecorded = record.timestamp
      }
    }
  })
  
  return stats
}

export const useEmotionStore = create<EmotionState>()(
  persist(
    (set, get) => ({
      // Initial state
      records: [],
      stats: createInitialStats(),
      currentSession: null,

      // Add emotion record
      addEmotionRecord: (emotion: EmotionType, intensity: number, note: string, conversationSummary?: ConversationSummary, emotionEvaluation?: EmotionEvaluation, polarityAnalysis?: EmotionPolarityAnalysis) => {
        const newRecord: EmotionRecord = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          emotion,
          behavioralImpact: calculateBehavioralImpact(emotion, intensity, note).impactScore, // Use calculation function
          note,
          timestamp: new Date(),
          conversationSummary,
          emotionEvaluation,
          polarityAnalysis,
        }

        set((state) => {
          const newRecords = [...state.records, newRecord]
          const newStats = recalculateStats(newRecords)
          

          
          return {
            records: newRecords,
            stats: newStats,
          }
        })
      },

      // Get records by emotion
      getRecordsByEmotion: (emotion: EmotionType) => {
        return get().records.filter((record) => record.emotion === emotion)
      },

      // Get records by date range
      getRecordsByDateRange: (startDate: Date, endDate: Date) => {
        return get().records.filter(
          (record) =>
            record.timestamp >= startDate && record.timestamp <= endDate
        )
      },

      // Get statistics data
      getEmotionStats: () => {
        return get().stats
      },

      // Get recent records from last few days
      getRecentEmotions: (days: number) => {
        const now = new Date()
        const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        return get().records
          .filter((record) => record.timestamp >= daysAgo)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      },

      // Clear all records
      clearAllRecords: () => {
        set({
          records: [],
          stats: createInitialStats(),
          currentSession: null,
        })
      },

      // Delete single record
      deleteRecord: (recordId: string) => {
        set((state) => {
          const updatedRecords = state.records.filter(record => record.id !== recordId)
          const newStats = recalculateStats(updatedRecords)
          
          return {
            records: updatedRecords,
            stats: newStats,
          }
        })
      },

      // Start chat session
      startChatSession: (emotion: EmotionType) => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          emotion,
          messages: [],
          startTime: new Date(),
        }

        set({ currentSession: newSession })
      },

      // End chat session
      endChatSession: () => {
        const currentSession = get().currentSession
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            endTime: new Date(),
          }


          
          // Clear current session
          setTimeout(() => {
            set({ currentSession: null })
          }, 100)
        }
      },

      // Add message
      addMessage: (content: string, role: 'user' | 'assistant') => {
        const currentSession = get().currentSession
        if (currentSession) {
          const newMessage: ChatMessage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            content,
            role,
            timestamp: new Date(),
          }

          const updatedSession = {
            ...currentSession,
            messages: [...currentSession.messages, newMessage],
          }

          set({ currentSession: updatedSession })
        }
      },
    }),
    {
      name: 'emotion-storage',
      // Only persist records and stats, not currentSession
      partialize: (state) => ({
        records: state.records,
        stats: state.stats,
      }),
      // Custom storage, properly handle Date objects and support SSR
      storage: {
        getItem: (name) => {
          // SSR safety check
          if (typeof window === 'undefined') return null
          
          try {
            const value = localStorage.getItem(name)
            if (!value) return null
            
            const parsed = JSON.parse(value)
            
            // Convert timestamp strings back to Date objects
            if (parsed.state?.records) {
              parsed.state.records = parsed.state.records.map((record: any) => ({
                ...record,
                timestamp: new Date(record.timestamp)
              }))
            }
            
            // Convert lastRecorded strings back to Date objects
            if (parsed.state?.stats) {
              Object.keys(parsed.state.stats).forEach(emotion => {
                if (parsed.state.stats[emotion].lastRecorded) {
                  parsed.state.stats[emotion].lastRecorded = new Date(parsed.state.stats[emotion].lastRecorded)
                }
              })
            }
            
            return parsed
          } catch (error) {
            console.error('Failed to parse localStorage data:', error)
            return null
          }
        },
        setItem: (name, value) => {
          // SSR safety check
          if (typeof window === 'undefined') return
          
          try {
            // Convert Date objects to strings for storage
            const toStore = {
              ...value,
              state: {
                ...value.state,
                records: value.state.records?.map((record: any) => ({
                  ...record,
                  timestamp: record.timestamp.toISOString()
                })) || [],
                stats: value.state.stats ? Object.keys(value.state.stats).reduce((acc: any, emotion) => {
                  const stat = value.state.stats[emotion]
                  if (stat) {
                    acc[emotion] = {
                      ...stat,
                      lastRecorded: stat.lastRecorded ? stat.lastRecorded.toISOString() : undefined
                    }
                  }
                  return acc
                }, {}) : {}
              }
            }
            
            localStorage.setItem(name, JSON.stringify(toStore))
          } catch (error) {
            console.error('Failed to save to localStorage:', error)
          }
        },
        removeItem: (name) => {
          // SSR safety check
          if (typeof window === 'undefined') return
          
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.error('Failed to remove data from localStorage:', error)
          }
        },
      },
      // Post-data recovery processing
      onRehydrateStorage: () => (state) => {
        if (state && state.records && state.records.length > 0) {
          // Ensure data consistency, recalculate statistics
          const recalculatedStats = recalculateStats(state.records)
          state.stats = recalculatedStats
        }
      },
    }
  )
)
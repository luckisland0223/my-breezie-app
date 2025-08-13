import { secureStorage } from '@/lib/securityUtils'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type EmotionType = 'Anger' | 'Disgust' | 'Fear' | 'Joy' | 'Sadness' | 'Surprise' | 'Anxiety' | 'Love' | 'Pride' | 'Shame' | 'Envy' | 'Guilt' | 'Hope' | 'Excitement' | 'Boredom' | 'Confusion' | 'Gratitude' | 'Loneliness' | 'Frustration' | 'Contentment' | 'Other'
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

export type RecordType = 'chat' | 'quick_check'

export interface EmotionRecord {
  id: string
  user_id?: string // User ID (optional, for future use)
  emotion: EmotionType // User's initially selected emotion
  behavioralImpact: number // Emotion's impact on behavior (1-10)
  note: string
  timestamp: Date
  recordType: RecordType // Type of record: 'chat' for conversation records, 'quick_check' for quick emotion checks
  emotionEvaluation?: EmotionEvaluation // AI emotion assessment (optional)
  polarityAnalysis?: EmotionPolarityAnalysis // Emotion polarity analysis (enhanced)
  conversationSummary?: string // Summary of conversation for chat records
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
    'Other': { decision: 1.0, social: 1.0, productivity: 1.0 }
  }
  
  const adjustment = (impactAdjustments as any)[emotion] || { decision: 1.0, social: 1.0, productivity: 1.0 }
  
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
    'Other': 1.0   // Other emotions have medium impact
  }
  return (multipliers as any)[emotion] || 1.0
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
      case 'Other':
        changes.push('Variable behavioral changes', 'Unpredictable social interactions', 'Inconsistent productivity')
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
  addEmotionRecord: (emotion: EmotionType, intensity: number, note: string, recordType?: RecordType, emotionEvaluation?: EmotionEvaluation, polarityAnalysis?: EmotionPolarityAnalysis, userId?: string, conversationSummary?: string) => void
  getRecordsByEmotion: (emotion: EmotionType) => EmotionRecord[]
  getRecordsByDateRange: (startDate: Date, endDate: Date) => EmotionRecord[]
  getEmotionStats: () => EmotionStats
  getRecentEmotions: (days: number) => EmotionRecord[]
  clearAllRecords: () => void
  deleteRecord: (recordId: string) => void
  replaceAllRecords: (records: EmotionRecord[]) => void
  loadFromServer: () => Promise<void>
  
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
      addEmotionRecord: async (emotion: EmotionType, intensity: number, note: string, recordType: RecordType = 'chat', emotionEvaluation?: EmotionEvaluation, polarityAnalysis?: EmotionPolarityAnalysis, userId?: string, conversationSummary?: string) => {
        try {
          const payload = {
            emotion,
            behavioralImpact: intensity,
            note,
            recordType,
            conversationSummary,
            // Flatten optional analytics
            actualEmotion: emotionEvaluation?.actualEmotion,
            actualIntensity: emotionEvaluation?.actualIntensity,
            emotionChanged: emotionEvaluation?.emotionChanged,
            confidenceLevel: emotionEvaluation?.confidenceLevel,
            analysis: emotionEvaluation?.analysis,
            polarity: polarityAnalysis?.polarity,
            polarityStrength: polarityAnalysis?.strength,
            polarityConfidence: polarityAnalysis?.confidence,
          }

          // attach auth header if available
          const headers: HeadersInit = { 'Content-Type': 'application/json' }
          const { useAuthStore } = await import('./auth')
          let token = useAuthStore.getState().token
          
          // Try to refresh token if not available
          if (!token) {
            const refreshSuccess = await useAuthStore.getState().refreshAuth()
            if (refreshSuccess) {
              token = useAuthStore.getState().token
            }
          }
          
          if (!token) {
            // Not authenticated: save locally for anonymous users
            const localRecord: EmotionRecord = {
              id: crypto.randomUUID(),
              user_id: undefined,
              emotion,
              behavioralImpact: intensity,
              note,
              timestamp: new Date(),
              recordType,
              conversationSummary,
              emotionEvaluation,
              polarityAnalysis,
            }
            
            set((state) => {
              const newRecords = [...state.records, localRecord]
              return {
                ...state,
                records: newRecords,
                stats: recalculateStats(newRecords)
              }
            })
            return
          }
          
          (headers as any).Authorization = `Bearer ${token}`

          const res = await fetch('/api/emotions', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          })
          const created = await res.json()
          if (!res.ok) throw new Error(created.error || 'Create failed')

          set((state) => {
            const newRecord: EmotionRecord = {
              id: created.id,
              user_id: created.userId,
              emotion: created.emotion,
              behavioralImpact: created.behavioralImpact,
              note: created.note,
              timestamp: new Date(created.createdAt),
              recordType: created.recordType,
              emotionEvaluation,
              polarityAnalysis,
              conversationSummary: created.conversationSummary,
            }
            const newRecords = [...state.records, newRecord]
            const newStats = recalculateStats(newRecords)
            return { records: newRecords, stats: newStats }
          })
        } catch (e) {
          console.error('Failed to create record via API:', e)
        }
      },

      // Get records by emotion
      getRecordsByEmotion: (emotion: EmotionType) => {
        return get().records.filter((record) => record.emotion === emotion)
      },

      // Get records by date range
      getRecordsByDateRange: (startDate: Date, endDate: Date) => {
        return get().records.filter(
          (record) =>
            record.timestamp >= startDate && 
            record.timestamp <= endDate
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
          .filter((record) => new Date(record.timestamp) >= daysAgo)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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

      // Replace all records (used when loading from API)
      replaceAllRecords: (incoming: EmotionRecord[]) => {
        const normalized = incoming.map(r => ({
          ...r,
          timestamp: new Date(r.timestamp),
        }))
        const newStats = recalculateStats(normalized)
        set({ records: normalized, stats: newStats })
      },

      // Load records from server and replace local records
      loadFromServer: async () => {
        try {
          // dynamic import to avoid SSR token issues
          const { useAuthStore } = await import('./auth')
          const token = useAuthStore.getState().token
          if (!token) return
          const res = await fetch('/api/emotions?page=1&limit=200', {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to load')
          const items = (data.items || []).map((it: any) => ({
            id: it.id,
            user_id: it.userId,
            emotion: it.emotion,
            behavioralImpact: it.behavioralImpact,
            note: it.note,
            timestamp: it.createdAt,
            recordType: it.recordType,
          })) as EmotionRecord[]
          get().replaceAllRecords(items)
        } catch (e) {
          console.error('Failed to load records from server:', e)
        }
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
      // Secure encrypted storage with Date object handling
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // SSR safety check
          if (typeof window === 'undefined') return null
          
          try {
            const value = secureStorage.getItem(name)
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
            
            return JSON.stringify(parsed)
          } catch (error) {
            console.error('Failed to parse secure storage data:', error)
            return null
          }
        },
        setItem: (name, value) => {
          // SSR safety check
          if (typeof window === 'undefined') return
          
          try {
            const parsed = JSON.parse(value)
            
            // Convert Date objects to strings for storage
            const toStore = {
              ...parsed,
              state: {
                ...parsed.state,
                records: parsed.state.records?.map((record: any) => ({
                  ...record,
                  timestamp: record.timestamp instanceof Date ? record.timestamp.toISOString() : record.timestamp
                })) || [],
                stats: parsed.state.stats ? Object.keys(parsed.state.stats).reduce((acc: any, emotion) => {
                  const stat = parsed.state.stats[emotion]
                  if (stat) {
                    acc[emotion] = {
                      ...stat,
                      lastRecorded: stat.lastRecorded instanceof Date ? stat.lastRecorded.toISOString() : stat.lastRecorded
                    }
                  }
                  return acc
                }, {}) : {}
              }
            }
            
            secureStorage.setItem(name, JSON.stringify(toStore))
          } catch (error) {
            console.error('Failed to save to secure storage:', error)
          }
        },
        removeItem: (name) => {
          // SSR safety check
          if (typeof window === 'undefined') return
          
          try {
            secureStorage.removeItem(name)
          } catch (error) {
            console.error('Failed to remove data from secure storage:', error)
          }
        },
      })),
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
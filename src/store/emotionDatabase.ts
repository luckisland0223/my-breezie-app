// Enhanced emotion store with database synchronization
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  EmotionType, 
  EmotionRecord, 
  EmotionStats, 
  ChatSession, 
  ChatMessage,
  EmotionEvaluation,
  EmotionPolarityAnalysis,
  RecordType 
} from './emotion'
import type { DatabaseEmotionRecord } from '@/lib/supabase/database'

// Convert database record to local record format
function dbRecordToLocal(dbRecord: DatabaseEmotionRecord): EmotionRecord {
  return {
    id: dbRecord.id,
    emotion: dbRecord.emotion,
    behavioralImpact: dbRecord.intensity, // Map intensity to behavioralImpact
    note: dbRecord.note || '',
    timestamp: new Date(dbRecord.timestamp),
    recordType: (dbRecord.note?.startsWith('Quick check:') ? 'quick_check' : 'chat') as RecordType, // Infer recordType from note
    emotionEvaluation: dbRecord.emotion_evaluation,
    polarityAnalysis: dbRecord.polarity_analysis
  }
}

// Convert local record to database format
function localRecordToDb(record: Omit<EmotionRecord, 'id'>, userId: string): Omit<DatabaseEmotionRecord, 'id' | 'created_at'> {
  return {
    user_id: userId,
    emotion: record.emotion,
    intensity: record.behavioralImpact, // Map behavioralImpact to intensity
    note: record.note,
    timestamp: record.timestamp.toISOString(),
    emotion_evaluation: record.emotionEvaluation,
    polarity_analysis: record.polarityAnalysis
  }
}

// Calculate stats from records
function recalculateStats(records: EmotionRecord[]): EmotionStats {
  const stats: EmotionStats = {}
  
  records.forEach(record => {
    const emotion = record.emotionEvaluation?.actualEmotion || record.emotion
    if (!stats[emotion]) {
      stats[emotion] = {
        count: 0,
        avgIntensity: 0,
        totalIntensity: 0,
        lastRecorded: undefined
      }
    }
    
    stats[emotion].count++
    stats[emotion].totalIntensity += record.behavioralImpact
    stats[emotion].avgIntensity = stats[emotion].totalIntensity / stats[emotion].count
    
    if (!stats[emotion].lastRecorded || record.timestamp > stats[emotion].lastRecorded!) {
      stats[emotion].lastRecorded = record.timestamp
    }
  })
  
  return stats
}

interface EmotionState {
  // Core data
  records: EmotionRecord[]
  stats: EmotionStats
  currentSession: ChatSession | null
  
  // Sync state
  isLoading: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  
  // Actions
  addEmotionRecord: (
    emotion: EmotionType, 
    intensity: number, 
    note: string, 
    recordType?: RecordType,
    emotionEvaluation?: EmotionEvaluation, 
    polarityAnalysis?: EmotionPolarityAnalysis,
    userId?: string
  ) => Promise<boolean>
  
  syncWithDatabase: (userId: string) => Promise<boolean>
  loadFromDatabase: (userId: string) => Promise<boolean>
  
  // Original methods
  getRecordsByEmotion: (emotion: EmotionType) => EmotionRecord[]
  getRecordsByDateRange: (startDate: Date, endDate: Date) => EmotionRecord[]
  getEmotionStats: () => EmotionStats
  getRecentEmotions: (days: number) => EmotionRecord[]
  clearAllRecords: () => void
  deleteRecord: (recordId: string, userId?: string) => Promise<boolean>
  
  // Chat session methods
  startChatSession: (emotion: EmotionType) => void
  endChatSession: () => void
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  getChatMessages: () => ChatMessage[]
}

export const useEmotionStore = create<EmotionState>()(
  persist(
    (set, get) => ({
      // Initial state
      records: [],
      stats: {},
      currentSession: null,
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
      
      // Add emotion record with database sync
            addEmotionRecord: async (
        emotion: EmotionType,
        intensity: number,
        note: string,
        recordType: RecordType = 'chat',
        emotionEvaluation?: EmotionEvaluation,
        polarityAnalysis?: EmotionPolarityAnalysis,
        userId?: string
      ) => {
        const newRecord: Omit<EmotionRecord, 'id'> = {
          emotion,
          behavioralImpact: intensity, // Map intensity parameter to behavioralImpact field
          note,
          timestamp: new Date(),
          recordType,
          emotionEvaluation,
          polarityAnalysis,
        }

        // First, add to local state immediately for responsiveness
        const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const tempRecord: EmotionRecord = { ...newRecord, id: tempId }
        
        set((state) => {
          const newRecords = [...state.records, tempRecord]
          const newStats = recalculateStats(newRecords)
          return {
            records: newRecords,
            stats: newStats,
          }
        })

        // If user is logged in, sync to database
        if (userId) {
          try {
            const response = await fetch('/api/emotions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                emotion,
                intensity,
                note,
                emotionEvaluation,
                polarityAnalysis
              })
            })

            if (response.ok) {
              const data = await response.json()
              // Replace temp record with real record from database
              set((state) => {
                const newRecords = state.records.map(r => 
                  r.id === tempId ? dbRecordToLocal(data.record) : r
                )
                const newStats = recalculateStats(newRecords)
                return {
                  records: newRecords,
                  stats: newStats,
                  lastSyncTime: new Date()
                }
              })
              return true
            } else {
              console.error('Failed to save emotion record to database')
              return false
            }
          } catch (error) {
            console.error('Error saving emotion record:', error)
            return false
          }
        }
        
        return true
      },

      // Sync with database
      syncWithDatabase: async (userId: string) => {
        set({ isSyncing: true })
        
        try {
          const response = await fetch(`/api/emotions?userId=${userId}`)
          if (response.ok) {
            const data = await response.json()
            const dbRecords = data.records.map(dbRecordToLocal)
            
            set((state) => ({
              records: dbRecords,
              stats: recalculateStats(dbRecords),
              isSyncing: false,
              lastSyncTime: new Date()
            }))
            
            return true
          } else {
            set({ isSyncing: false })
            return false
          }
        } catch (error) {
          console.error('Error syncing with database:', error)
          set({ isSyncing: false })
          return false
        }
      },

      // Load data from database
      loadFromDatabase: async (userId: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch(`/api/emotions?userId=${userId}`)
          if (response.ok) {
            const data = await response.json()
            const dbRecords = data.records.map(dbRecordToLocal)
            
            set(() => ({
              records: dbRecords,
              stats: recalculateStats(dbRecords),
              isLoading: false,
              lastSyncTime: new Date()
            }))
            
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Error loading from database:', error)
          set({ isLoading: false })
          return false
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
          .filter((record) => new Date(record.timestamp) >= daysAgo)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      },

      // Clear all records
      clearAllRecords: () => {
        set({
          records: [],
          stats: {},
          currentSession: null,
        })
      },

      // Delete single record
      deleteRecord: async (recordId: string, userId?: string) => {
        // Remove from local state immediately
        set((state) => {
          const updatedRecords = state.records.filter(record => record.id !== recordId)
          const newStats = recalculateStats(updatedRecords)
          
          return {
            records: updatedRecords,
            stats: newStats,
          }
        })

        // If user is logged in, delete from database
        if (userId) {
          try {
            const response = await fetch(`/api/emotions/${recordId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId })
            })

            return response.ok
          } catch (error) {
            console.error('Error deleting emotion record:', error)
            return false
          }
        }

        return true
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

          // Clear current session after a short delay
          setTimeout(() => {
            set({ currentSession: null })
          }, 1000)
        }
      },

      // Add chat message
      addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const currentSession = get().currentSession
        if (!currentSession) return

        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        }

        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            messages: [...state.currentSession.messages, newMessage]
          } : null
        }))
      },

      // Get chat messages
      getChatMessages: () => {
        return get().currentSession?.messages || []
      },
    }),
    {
      name: 'emotion-storage',
      partialize: (state) => ({ 
        records: state.records, 
        stats: state.stats,
        lastSyncTime: state.lastSyncTime
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure date fields from localStorage are properly converted to Date objects
          if (state.lastSyncTime && typeof state.lastSyncTime === 'string') {
            state.lastSyncTime = new Date(state.lastSyncTime)
          }
          if (state.records) {
            state.records = state.records.map(record => ({
              ...record,
              timestamp: typeof record.timestamp === 'string' 
                ? new Date(record.timestamp) 
                : record.timestamp
            }))
          }
        }
      }
    }
  )
)
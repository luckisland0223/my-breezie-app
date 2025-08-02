import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type EmotionType = '愤怒' | '厌恶' | '恐惧' | '快乐' | '悲伤' | '惊讶' | '复杂'
export type PolarityType = 'positive' | 'negative' | 'neutral'

export interface EmotionPolarityAnalysis {
  polarity: PolarityType // 情绪极性：积极/消极/中性
  strength: number // 情绪真实强度 (1-10)
  confidence: number // 极性判断置信度 (1-10)
}

export interface EmotionEvaluation {
  actualEmotion: EmotionType // AI分析的真实情绪
  actualIntensity: number // AI评估的真实强度 (1-10)
  emotionChanged: boolean // 情绪是否与初始不同
  confidenceLevel: number // AI评估的置信度 (1-10)
  analysis: string // 情绪分析说明
}

export interface ConversationSummary {
  userProblem: string // 用户遇到的问题
  solution: string // 提供的解决方案
  userReaction: string // 用户的最后反应
}

export interface EmotionRecord {
  id: string
  emotion: EmotionType // 用户初始选择的情绪
  intensity: number // 对话效果评分 (1-10) - 重新定义为对话帮助程度
  note: string
  timestamp: Date
  conversationSummary?: ConversationSummary // 对话摘要（可选）
  emotionEvaluation?: EmotionEvaluation // AI情绪评估（可选）
  polarityAnalysis?: EmotionPolarityAnalysis // 情绪极性分析（新增）
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
  // 核心数据
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

// 初始化统计数据
const createInitialStats = (): EmotionStats => ({
  '愤怒': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  '厌恶': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  '恐惧': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  '快乐': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  '悲伤': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  '惊讶': { count: 0, avgIntensity: 0, totalIntensity: 0 },
  '复杂': { count: 0, avgIntensity: 0, totalIntensity: 0 },
})

// 重新计算统计数据（从records重新计算，确保数据一致性）
// 优先使用AI评估的真实情绪和强度，如果没有则使用用户初始选择
const recalculateStats = (records: EmotionRecord[]): EmotionStats => {
  const stats = createInitialStats()
  
  records.forEach(record => {
    // 使用AI评估的情绪和强度（如果有的话），否则使用用户初始选择
    const actualEmotion = record.emotionEvaluation?.actualEmotion || record.emotion
    const actualIntensity = record.emotionEvaluation?.actualIntensity || record.intensity
    
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
      // 初始状态
      records: [],
      stats: createInitialStats(),
      currentSession: null,

      // 添加情绪记录
      addEmotionRecord: (emotion: EmotionType, intensity: number, note: string, conversationSummary?: ConversationSummary, emotionEvaluation?: EmotionEvaluation, polarityAnalysis?: EmotionPolarityAnalysis) => {
        const newRecord: EmotionRecord = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          emotion,
          intensity,
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

      // 根据情绪获取记录
      getRecordsByEmotion: (emotion: EmotionType) => {
        return get().records.filter((record) => record.emotion === emotion)
      },

      // 根据日期范围获取记录
      getRecordsByDateRange: (startDate: Date, endDate: Date) => {
        return get().records.filter(
          (record) =>
            record.timestamp >= startDate && record.timestamp <= endDate
        )
      },

      // 获取统计数据
      getEmotionStats: () => {
        return get().stats
      },

      // 获取最近几天的记录
      getRecentEmotions: (days: number) => {
        const now = new Date()
        const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        return get().records
          .filter((record) => record.timestamp >= daysAgo)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      },

      // 清除所有记录
      clearAllRecords: () => {
        set({
          records: [],
          stats: createInitialStats(),
          currentSession: null,
        })
      },

      // 删除单个记录
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

      // 开始聊天会话
      startChatSession: (emotion: EmotionType) => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          emotion,
          messages: [],
          startTime: new Date(),
        }

        set({ currentSession: newSession })
      },

      // 结束聊天会话
      endChatSession: () => {
        const currentSession = get().currentSession
        if (currentSession) {
          const updatedSession = {
            ...currentSession,
            endTime: new Date(),
          }


          
          // 清除当前会话
          setTimeout(() => {
            set({ currentSession: null })
          }, 100)
        }
      },

      // 添加消息
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
      // 只持久化records和stats，不持久化currentSession
      partialize: (state) => ({
        records: state.records,
        stats: state.stats,
      }),
      // 自定义存储，正确处理Date对象，并支持SSR
      storage: {
        getItem: (name) => {
          // SSR安全检查
          if (typeof window === 'undefined') return null
          
          try {
            const value = localStorage.getItem(name)
            if (!value) return null
            
            const parsed = JSON.parse(value)
            
            // 转换timestamp字符串回Date对象
            if (parsed.state?.records) {
              parsed.state.records = parsed.state.records.map((record: any) => ({
                ...record,
                timestamp: new Date(record.timestamp)
              }))
            }
            
            // 转换lastRecorded字符串回Date对象
            if (parsed.state?.stats) {
              Object.keys(parsed.state.stats).forEach(emotion => {
                if (parsed.state.stats[emotion].lastRecorded) {
                  parsed.state.stats[emotion].lastRecorded = new Date(parsed.state.stats[emotion].lastRecorded)
                }
              })
            }
            
            return parsed
          } catch (error) {
            console.error('解析localStorage数据失败:', error)
            return null
          }
        },
        setItem: (name, value) => {
          // SSR安全检查
          if (typeof window === 'undefined') return
          
          try {
            // 转换Date对象为字符串进行存储
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
            console.error('保存到localStorage失败:', error)
          }
        },
        removeItem: (name) => {
          // SSR安全检查
          if (typeof window === 'undefined') return
          
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.error('从localStorage删除数据失败:', error)
          }
        },
      },
      // 数据恢复后的处理
      onRehydrateStorage: () => (state) => {
        if (state && state.records && state.records.length > 0) {
          // 确保数据一致性，重新计算统计
          const recalculatedStats = recalculateStats(state.records)
          state.stats = recalculatedStats
        }
      },
    }
  )
)
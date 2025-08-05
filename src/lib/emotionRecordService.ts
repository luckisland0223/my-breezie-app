// 情绪记录服务 - 支持新的分表API
import type { EmotionType, EmotionEvaluation, EmotionPolarityAnalysis } from '@/store/emotion'

export interface QuickEmotionCheckData {
  emotion: EmotionType
  intensity: number  // 1-10 用户主观选择
}

export interface ConversationEmotionData {
  emotion: EmotionType
  behavioralImpactScore: number  // AI计算的行为影响分数
  conversationText: string       // 完整对话内容
  emotionEvaluation?: EmotionEvaluation
  polarityAnalysis?: EmotionPolarityAnalysis
}

// 创建快速情绪检查记录
export async function createQuickEmotionCheckRecord(
  userId: string,
  data: QuickEmotionCheckData
): Promise<boolean> {
  try {
    const response = await fetch('/api/emotions-split', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        recordType: 'quick_check',
        emotion: data.emotion,
        intensity: data.intensity,
        note: `Quick check: ${data.emotion} at intensity ${data.intensity}`
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to create quick emotion check:', errorData.error)
      return false
    }

    const result = await response.json()
    
    if (result.success) {
      // 触发数据刷新事件
      window.dispatchEvent(new CustomEvent('emotionRecordAdded', { 
        detail: { record: result.record, type: 'quick_check' } 
      }))
      return true
    }

    return false

  } catch (error) {
    console.error('Error creating quick emotion check record:', error)
    return false
  }
}

// 创建对话情绪记录
export async function createConversationEmotionRecord(
  userId: string,
  data: ConversationEmotionData
): Promise<boolean> {
  try {
    const response = await fetch('/api/emotions-split', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        recordType: 'conversation',
        emotion: data.emotion,
        conversationText: data.conversationText,
        behavioralImpactScore: data.behavioralImpactScore,
        emotionEvaluation: data.emotionEvaluation,
        polarityAnalysis: data.polarityAnalysis
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to create conversation emotion record:', errorData.error)
      return false
    }

    const result = await response.json()
    
    if (result.success) {
      // 触发数据刷新事件
      window.dispatchEvent(new CustomEvent('emotionRecordAdded', { 
        detail: { record: result.record, type: 'conversation' } 
      }))
      return true
    }

    return false

  } catch (error) {
    console.error('Error creating conversation emotion record:', error)
    return false
  }
}

// 获取用户所有情绪记录
export async function getUserEmotionRecords(
  userId: string,
  options?: {
    recordType?: 'quick' | 'conversation' | 'all'
    startDate?: string
    endDate?: string
  }
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      userId,
      ...(options?.recordType && { recordType: options.recordType }),
      ...(options?.startDate && { startDate: options.startDate }),
      ...(options?.endDate && { endDate: options.endDate })
    })

    const response = await fetch(`/api/emotions-split?${params}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to fetch emotion records:', errorData.error)
      return []
    }

    const result = await response.json()
    return result.success ? result.records : []

  } catch (error) {
    console.error('Error fetching emotion records:', error)
    return []
  }
}

// 兼容性函数 - 支持旧的调用方式
export async function addEmotionRecord(
  userId: string,
  emotion: EmotionType,
  intensity: number,
  note: string,
  recordType: 'chat' | 'quick_check' = 'chat',
  emotionEvaluation?: EmotionEvaluation,
  polarityAnalysis?: EmotionPolarityAnalysis
): Promise<boolean> {
  
  if (recordType === 'quick_check') {
    return await createQuickEmotionCheckRecord(userId, {
      emotion,
      intensity
    })
  } else {
    // chat/conversation 记录
    return await createConversationEmotionRecord(userId, {
      emotion,
      behavioralImpactScore: intensity,
      conversationText: note,
      emotionEvaluation,
      polarityAnalysis
    })
  }
}

// 计算情绪统计数据
export function calculateEmotionStats(records: any[]) {
  const stats = {
    totalRecords: records.length,
    quickCheckCount: 0,
    conversationCount: 0,
    emotionDistribution: {} as Record<EmotionType, number>,
    averageIntensity: 0,
    mostFrequentEmotion: null as EmotionType | null,
    recentTrend: 'stable' as 'increasing' | 'decreasing' | 'stable'
  }

  if (records.length === 0) return stats

  let totalIntensity = 0
  const emotionCounts: Record<string, number> = {}

  records.forEach(record => {
    // 统计记录类型
    if (record.recordType === 'quick_check') {
      stats.quickCheckCount++
    } else {
      stats.conversationCount++
    }

    // 统计情绪分布
    emotionCounts[record.emotion] = (emotionCounts[record.emotion] || 0) + 1
    totalIntensity += record.intensity
  })

  // 计算平均强度
  stats.averageIntensity = Math.round((totalIntensity / records.length) * 10) / 10

  // 找出最频繁的情绪
  let maxCount = 0
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    stats.emotionDistribution[emotion as EmotionType] = count
    if (count > maxCount) {
      maxCount = count
      stats.mostFrequentEmotion = emotion as EmotionType
    }
  }

  // 计算趋势（简单实现：比较最近一周和上周的平均强度）
  if (records.length >= 7) {
    const recentRecords = records.slice(0, 7)
    const olderRecords = records.slice(7, 14)
    
    if (olderRecords.length > 0) {
      const recentAvg = recentRecords.reduce((sum, r) => sum + r.intensity, 0) / recentRecords.length
      const olderAvg = olderRecords.reduce((sum, r) => sum + r.intensity, 0) / olderRecords.length
      
      const difference = recentAvg - olderAvg
      if (difference > 0.5) {
        stats.recentTrend = 'increasing'
      } else if (difference < -0.5) {
        stats.recentTrend = 'decreasing'
      }
    }
  }

  return stats
}

// 导出用于事件监听的类型
export interface EmotionRecordEvent extends CustomEvent {
  detail: {
    record: any
    type: 'quick_check' | 'conversation'
  }
}
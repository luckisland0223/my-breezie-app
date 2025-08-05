import { getSupabaseClient } from './client'
import type { EmotionType, EmotionEvaluation, EmotionPolarityAnalysis } from '@/store/emotion'

export interface DatabaseProfile {
  id: string
  email?: string
  user_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// 快速情绪检查记录接口
export interface DatabaseQuickEmotionCheck {
  id: string
  user_id: string
  emotion: EmotionType
  intensity: number  // 1-10 用户主观选择的强度
  timestamp: string
  created_at: string
}

// 对话情绪记录接口
export interface DatabaseConversationEmotionRecord {
  id: string
  user_id: string
  emotion: EmotionType
  behavioral_impact_score: number  // 0.00-10.00 AI计算的行为影响分数
  conversation_text: string        // 完整对话内容
  emotion_evaluation?: EmotionEvaluation
  polarity_analysis?: EmotionPolarityAnalysis
  timestamp: string
  created_at: string
}

// 统一的情绪记录接口（用于前端展示）
export interface UnifiedEmotionRecord {
  id: string
  user_id: string
  emotion: EmotionType
  intensity: number  // 统一为整数显示
  note: string      // 展示用的描述文本
  timestamp: string
  recordType: 'quick_check' | 'conversation'
  emotion_evaluation?: EmotionEvaluation
  polarity_analysis?: EmotionPolarityAnalysis
  conversation_text?: string  // 只有对话记录才有
  created_at: string
}

// ===========================================
// 用户配置相关 (保持不变)
// ===========================================

export async function getUserProfile(userId: string): Promise<DatabaseProfile | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data as unknown as DatabaseProfile
}

export async function updateUserProfile(userId: string, updates: Partial<DatabaseProfile>): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    console.error('Error updating user profile:', error)
    return false
  }

  return true
}

// ===========================================
// 快速情绪检查相关
// ===========================================

export async function createQuickEmotionCheck(
  record: Omit<DatabaseQuickEmotionCheck, 'id' | 'created_at'>
): Promise<DatabaseQuickEmotionCheck | null> {
  try {
    console.log('Creating quick emotion check with record:', record)
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('quick_emotion_checks')
      .insert([record])
      .select()
      .single()

    if (error) {
      console.error('Error creating quick emotion check:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        record
      })
      throw error // 抛出错误而不是返回null，让上层处理
    }

    console.log('Quick emotion check created successfully:', data)
    return data as unknown as DatabaseQuickEmotionCheck
  } catch (error: any) {
    console.error('Exception in createQuickEmotionCheck:', error)
    throw error // 重新抛出错误
  }
}

export async function getUserQuickEmotionChecks(userId: string): Promise<DatabaseQuickEmotionCheck[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('quick_emotion_checks')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching quick emotion checks:', error)
    return []
  }

  return (data || []) as unknown as DatabaseQuickEmotionCheck[]
}

export async function getQuickEmotionChecksByDateRange(
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<DatabaseQuickEmotionCheck[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('quick_emotion_checks')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching quick emotion checks by date range:', error)
    return []
  }

  return (data || []) as unknown as DatabaseQuickEmotionCheck[]
}

export async function deleteQuickEmotionCheck(recordId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('quick_emotion_checks')
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting quick emotion check:', error)
    return false
  }

  return true
}

// ===========================================
// 对话情绪记录相关
// ===========================================

export async function createConversationEmotionRecord(
  record: Omit<DatabaseConversationEmotionRecord, 'id' | 'created_at'>
): Promise<DatabaseConversationEmotionRecord | null> {
  try {
    console.log('Creating conversation emotion record with record:', {
      ...record,
      conversation_text_length: record.conversation_text?.length || 0
    })
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('conversation_emotion_records')
      .insert([record])
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation emotion record:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        record: {
          ...record,
          conversation_text_length: record.conversation_text?.length || 0
        }
      })
      throw error // 抛出错误而不是返回null，让上层处理
    }

    console.log('Conversation emotion record created successfully:', data.id)
    return data as unknown as DatabaseConversationEmotionRecord
  } catch (error: any) {
    console.error('Exception in createConversationEmotionRecord:', error)
    throw error // 重新抛出错误
  }
}

export async function getUserConversationEmotionRecords(userId: string): Promise<DatabaseConversationEmotionRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('conversation_emotion_records')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching conversation emotion records:', error)
    return []
  }

  return (data || []) as unknown as DatabaseConversationEmotionRecord[]
}

export async function getConversationEmotionRecordsByDateRange(
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<DatabaseConversationEmotionRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('conversation_emotion_records')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching conversation emotion records by date range:', error)
    return []
  }

  return (data || []) as unknown as DatabaseConversationEmotionRecord[]
}

export async function deleteConversationEmotionRecord(recordId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('conversation_emotion_records')
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting conversation emotion record:', error)
    return false
  }

  return true
}

// ===========================================
// 统一查询函数 (用于前端展示)
// ===========================================

export async function getAllUserEmotionRecords(userId: string): Promise<UnifiedEmotionRecord[]> {
  try {
    // 并行获取两种记录
    const [quickChecks, conversationRecords] = await Promise.all([
      getUserQuickEmotionChecks(userId),
      getUserConversationEmotionRecords(userId)
    ])

    // 转换快速检查记录
    const unifiedQuickChecks: UnifiedEmotionRecord[] = quickChecks.map(record => ({
      id: record.id,
      user_id: record.user_id,
      emotion: record.emotion,
      intensity: record.intensity,
      note: `Quick check: ${record.emotion} at intensity ${record.intensity}`,
      timestamp: record.timestamp,
      recordType: 'quick_check' as const,
      created_at: record.created_at
    }))

    // 转换对话记录
    const unifiedConversationRecords: UnifiedEmotionRecord[] = conversationRecords.map(record => ({
      id: record.id,
      user_id: record.user_id,
      emotion: record.emotion,
      intensity: Math.round(record.behavioral_impact_score), // 转换为整数显示
      note: record.conversation_text.length > 100 
        ? record.conversation_text.substring(0, 100) + '...' 
        : record.conversation_text,
      timestamp: record.timestamp,
      recordType: 'conversation' as const,
      emotion_evaluation: record.emotion_evaluation,
      polarity_analysis: record.polarity_analysis,
      conversation_text: record.conversation_text,
      created_at: record.created_at
    }))

    // 合并并按时间排序
    const allRecords = [...unifiedQuickChecks, ...unifiedConversationRecords]
    allRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return allRecords

  } catch (error) {
    console.error('Error fetching all user emotion records:', error)
    return []
  }
}

export async function getAllUserEmotionRecordsByDateRange(
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<UnifiedEmotionRecord[]> {
  try {
    // 并行获取两种记录
    const [quickChecks, conversationRecords] = await Promise.all([
      getQuickEmotionChecksByDateRange(userId, startDate, endDate),
      getConversationEmotionRecordsByDateRange(userId, startDate, endDate)
    ])

    // 转换逻辑同上
    const unifiedQuickChecks: UnifiedEmotionRecord[] = quickChecks.map(record => ({
      id: record.id,
      user_id: record.user_id,
      emotion: record.emotion,
      intensity: record.intensity,
      note: `Quick check: ${record.emotion} at intensity ${record.intensity}`,
      timestamp: record.timestamp,
      recordType: 'quick_check' as const,
      created_at: record.created_at
    }))

    const unifiedConversationRecords: UnifiedEmotionRecord[] = conversationRecords.map(record => ({
      id: record.id,
      user_id: record.user_id,
      emotion: record.emotion,
      intensity: Math.round(record.behavioral_impact_score),
      note: record.conversation_text.length > 100 
        ? record.conversation_text.substring(0, 100) + '...' 
        : record.conversation_text,
      timestamp: record.timestamp,
      recordType: 'conversation' as const,
      emotion_evaluation: record.emotion_evaluation,
      polarity_analysis: record.polarity_analysis,
      conversation_text: record.conversation_text,
      created_at: record.created_at
    }))

    const allRecords = [...unifiedQuickChecks, ...unifiedConversationRecords]
    allRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return allRecords

  } catch (error) {
    console.error('Error fetching user emotion records by date range:', error)
    return []
  }
}

// ===========================================
// 数据同步函数 (更新版本)
// ===========================================

export async function syncUserData(userId: string) {
  try {
    // 获取用户配置
    const profile = await getUserProfile(userId)
    
    // 获取所有情绪记录（统一格式）
    const emotionRecords = await getAllUserEmotionRecords(userId)
    
    return {
      profile,
      emotionRecords,
      success: true
    }
  } catch (error) {
    console.error('Error syncing user data:', error)
    return {
      profile: null,
      emotionRecords: [],
      success: false
    }
  }
}

// ===========================================
// 兼容性函数 (向后兼容旧代码)
// ===========================================

// 兼容旧的createEmotionRecord函数
export async function createEmotionRecord(record: {
  user_id: string
  emotion: EmotionType
  intensity: number
  note: string
  timestamp: string
  emotion_evaluation?: EmotionEvaluation
  polarity_analysis?: EmotionPolarityAnalysis
}): Promise<UnifiedEmotionRecord | null> {
  
  // 根据note内容判断记录类型
  const isQuickCheck = record.note.startsWith('Quick check:')
  
  if (isQuickCheck) {
    // 创建快速检查记录
    const quickRecord = await createQuickEmotionCheck({
      user_id: record.user_id,
      emotion: record.emotion,
      intensity: record.intensity,
      timestamp: record.timestamp
    })
    
    if (!quickRecord) return null
    
    return {
      id: quickRecord.id,
      user_id: quickRecord.user_id,
      emotion: quickRecord.emotion,
      intensity: quickRecord.intensity,
      note: record.note,
      timestamp: quickRecord.timestamp,
      recordType: 'quick_check',
      created_at: quickRecord.created_at
    }
  } else {
    // 创建对话记录
    const conversationRecord = await createConversationEmotionRecord({
      user_id: record.user_id,
      emotion: record.emotion,
      behavioral_impact_score: record.intensity,
      conversation_text: record.note,
      emotion_evaluation: record.emotion_evaluation,
      polarity_analysis: record.polarity_analysis,
      timestamp: record.timestamp
    })
    
    if (!conversationRecord) return null
    
    return {
      id: conversationRecord.id,
      user_id: conversationRecord.user_id,
      emotion: conversationRecord.emotion,
      intensity: Math.round(conversationRecord.behavioral_impact_score),
      note: conversationRecord.conversation_text,
      timestamp: conversationRecord.timestamp,
      recordType: 'conversation',
      emotion_evaluation: conversationRecord.emotion_evaluation,
      polarity_analysis: conversationRecord.polarity_analysis,
      conversation_text: conversationRecord.conversation_text,
      created_at: conversationRecord.created_at
    }
  }
}

// 兼容旧的getUserEmotionRecords函数
export async function getUserEmotionRecords(userId: string): Promise<UnifiedEmotionRecord[]> {
  return await getAllUserEmotionRecords(userId)
}
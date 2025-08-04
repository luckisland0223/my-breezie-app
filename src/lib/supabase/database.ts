import { getSupabaseClient } from './client'
import type { EmotionType, EmotionRecord, ChatSession, ChatMessage, EmotionEvaluation, EmotionPolarityAnalysis } from '@/store/emotion'

export interface DatabaseProfile {
  id: string
  email?: string
  user_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface DatabaseEmotionRecord {
  id: string
  user_id: string
  emotion: EmotionType
  intensity: number
  note?: string
  timestamp: string
  emotion_evaluation?: EmotionEvaluation
  polarity_analysis?: EmotionPolarityAnalysis
  created_at: string
}

export interface DatabaseChatSession {
  id: string
  user_id: string
  emotion: EmotionType
  start_time: string
  end_time?: string
  created_at: string
}

export interface DatabaseChatMessage {
  id: string
  session_id: string
  user_id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  created_at: string
}

// 用户配置相关
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

// 情绪记录相关
export async function createEmotionRecord(record: Omit<DatabaseEmotionRecord, 'id' | 'created_at'>): Promise<DatabaseEmotionRecord | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('emotion_records')
    .insert([record])
    .select()
    .single()

  if (error) {
    console.error('Error creating emotion record:', error)
    return null
  }

  return data as unknown as DatabaseEmotionRecord
}

export async function getUserEmotionRecords(userId: string): Promise<DatabaseEmotionRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('emotion_records')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching emotion records:', error)
    return []
  }

  return (data || []) as unknown as DatabaseEmotionRecord[]
}

export async function getEmotionRecordsByDateRange(
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<DatabaseEmotionRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('emotion_records')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('Error fetching emotion records by date range:', error)
    return []
  }

  return (data || []) as unknown as DatabaseEmotionRecord[]
}

export async function deleteEmotionRecord(recordId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('emotion_records')
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting emotion record:', error)
    return false
  }

  return true
}

// 聊天会话相关
export async function createChatSession(session: Omit<DatabaseChatSession, 'id' | 'created_at'>): Promise<DatabaseChatSession | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([session])
    .select()
    .single()

  if (error) {
    console.error('Error creating chat session:', error)
    return null
  }

  return data as unknown as DatabaseChatSession
}

export async function updateChatSession(sessionId: string, userId: string, updates: Partial<DatabaseChatSession>): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating chat session:', error)
    return false
  }

  return true
}

// 聊天消息相关
export async function createChatMessage(message: Omit<DatabaseChatMessage, 'id' | 'created_at'>): Promise<DatabaseChatMessage | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([message])
    .select()
    .single()

  if (error) {
    console.error('Error creating chat message:', error)
    return null
  }

  return data as unknown as DatabaseChatMessage
}

export async function getChatMessages(sessionId: string, userId: string): Promise<DatabaseChatMessage[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching chat messages:', error)
    return []
  }

  return (data || []) as unknown as DatabaseChatMessage[]
}

// 数据同步函数
export async function syncUserData(userId: string) {
  try {
    // 获取用户配置
    const profile = await getUserProfile(userId)
    
    // 获取情绪记录
    const emotionRecords = await getUserEmotionRecords(userId)
    
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
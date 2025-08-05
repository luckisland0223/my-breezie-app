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

// Quick emotion check record interface
export interface DatabaseQuickEmotionCheck {
  id: string
  user_id: string
  emotion: EmotionType
  intensity: number  // 1-10 user subjective intensity choice
  timestamp: string
  created_at: string
}

// Conversation emotion record interface
export interface DatabaseConversationEmotionRecord {
  id: string
  user_id: string
  emotion: EmotionType
  behavioral_impact_score: number  // 0.00-10.00 AI-calculated behavioral impact score
  conversation_text: string        // Complete conversation content
  emotion_evaluation?: EmotionEvaluation
  polarity_analysis?: EmotionPolarityAnalysis
  timestamp: string
  created_at: string
}

// Unified emotion record interface (for frontend display)
export interface UnifiedEmotionRecord {
  id: string
  user_id: string
  emotion: EmotionType
  intensity: number  // Unified as integer display
  note: string      // Description text for display
  timestamp: string
  recordType: 'quick_check' | 'conversation'
  emotion_evaluation?: EmotionEvaluation
  polarity_analysis?: EmotionPolarityAnalysis
  conversation_text?: string  // Only conversation records have this
  created_at: string
}

// ===========================================
// User configuration related (keep unchanged)
// ===========================================

export async function getUserProfile(userId: string): Promise<DatabaseProfile | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    
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
    
    return false
  }

  return true
}

// ===========================================
// Quick emotion check related
// ===========================================

export async function createQuickEmotionCheck(
  record: Omit<DatabaseQuickEmotionCheck, 'id' | 'created_at'>,
  supabaseClient?: any
): Promise<DatabaseQuickEmotionCheck | null> {
  try {

    const supabase = supabaseClient || getSupabaseClient()
    
    const { data, error } = await supabase
      .from('quick_emotion_checks')
      .insert([record])
      .select()
      .single()

    if (error) {
      throw error // Throw error instead of returning null, let upper layer handle
    }


    return data as unknown as DatabaseQuickEmotionCheck
  } catch (error: any) {

    throw error // Re-throw error
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
    
    return false
  }

  return true
}

// ===========================================
// Conversation emotion record related
// ===========================================

export async function createConversationEmotionRecord(
  record: Omit<DatabaseConversationEmotionRecord, 'id' | 'created_at'>,
  supabaseClient?: any
): Promise<DatabaseConversationEmotionRecord | null> {
  try {
    const supabase = supabaseClient || getSupabaseClient()
    
    const { data, error } = await supabase
      .from('conversation_emotion_records')
      .insert([record])
      .select()
      .single()

    if (error) {
      throw error // Throw error instead of returning null, let upper layer handle
    }


    return data as unknown as DatabaseConversationEmotionRecord
  } catch (error: any) {

    throw error // Re-throw error
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
    
    return false
  }

  return true
}

// ===========================================
// Unified query function (for frontend display)
// ===========================================

export async function getAllUserEmotionRecords(userId: string): Promise<UnifiedEmotionRecord[]> {
  try {
    // Get both types of records in parallel
    const [quickChecks, conversationRecords] = await Promise.all([
      getUserQuickEmotionChecks(userId),
      getUserConversationEmotionRecords(userId)
    ])

    // Convert quick check records
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

    // Convert conversation records
    const unifiedConversationRecords: UnifiedEmotionRecord[] = conversationRecords.map(record => ({
      id: record.id,
      user_id: record.user_id,
      emotion: record.emotion,
      intensity: Math.round(record.behavioral_impact_score), // Convert to integer display
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

    // Merge and sort by time
    const allRecords = [...unifiedQuickChecks, ...unifiedConversationRecords]
    allRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return allRecords

  } catch (error) {
    
    return []
  }
}

export async function getAllUserEmotionRecordsByDateRange(
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<UnifiedEmotionRecord[]> {
  try {
    // Get both types of records in parallel
    const [quickChecks, conversationRecords] = await Promise.all([
      getQuickEmotionChecksByDateRange(userId, startDate, endDate),
      getConversationEmotionRecordsByDateRange(userId, startDate, endDate)
    ])

    // Conversion logic same as above
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
    
    return []
  }
}

// ===========================================
// Data sync functions (updated version)
// ===========================================

export async function syncUserData(userId: string) {
  try {
    // Get user configuration
    const profile = await getUserProfile(userId)
    
    // Get all emotion records (unified format)
    const emotionRecords = await getAllUserEmotionRecords(userId)
    
    return {
      profile,
      emotionRecords,
      success: true
    }
  } catch (error) {
    
    return {
      profile: null,
      emotionRecords: [],
      success: false
    }
  }
}

// ===========================================
// Compatibility functions (backward compatible with old code)
// ===========================================

// Compatible with old createEmotionRecord function
export async function createEmotionRecord(record: {
  user_id: string
  emotion: EmotionType
  intensity: number
  note: string
  timestamp: string
  emotion_evaluation?: EmotionEvaluation
  polarity_analysis?: EmotionPolarityAnalysis
}): Promise<UnifiedEmotionRecord | null> {
  
  // Determine record type based on note content
  const isQuickCheck = record.note.startsWith('Quick check:')
  
  if (isQuickCheck) {
    // Create quick check record
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
    // Create conversation record
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

// Compatible with old getUserEmotionRecords function
export async function getUserEmotionRecords(userId: string): Promise<UnifiedEmotionRecord[]> {
  return await getAllUserEmotionRecords(userId)
}
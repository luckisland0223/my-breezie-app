// Database types that extend existing types for compatibility

import type { EmotionType } from '@/store/emotion'
import type { ChatMessage, ChatSession, EmotionRecord, User } from '@prisma/client'

// Extended types with relations
export type UserWithRelations = User & {
  emotionRecords?: EmotionRecord[]
  chatSessions?: ChatSession[]
}

export type EmotionRecordWithUser = EmotionRecord & {
  user: Pick<User, 'id' | 'username' | 'email'>
}

export type ChatSessionWithMessages = ChatSession & {
  messages: ChatMessage[]
  user?: Pick<User, 'id' | 'username' | 'email'>
}

export type ChatMessageWithSession = ChatMessage & {
  session?: ChatSession
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'username' | 'avatarUrl' | 'subscriptionTier'>
  token: string
}

// Emotion API types
export interface CreateEmotionRequest {
  emotion: EmotionType
  behavioralImpact: number
  note: string
  recordType?: 'chat' | 'quick_check'
  conversationSummary?: string
  // AI Analysis fields (optional)
  actualEmotion?: EmotionType
  actualIntensity?: number
  emotionChanged?: boolean
  confidenceLevel?: number
  analysis?: string
  // Polarity Analysis fields (optional)
  polarity?: 'positive' | 'negative' | 'neutral'
  polarityStrength?: number
  polarityConfidence?: number
}

export interface UpdateEmotionRequest {
  emotion?: EmotionType
  behavioralImpact?: number
  note?: string
  recordType?: 'chat' | 'quick_check'
  conversationSummary?: string
  // AI Analysis fields (optional)
  actualEmotion?: EmotionType
  actualIntensity?: number
  emotionChanged?: boolean
  confidenceLevel?: number
  analysis?: string
  // Polarity Analysis fields (optional)
  polarity?: 'positive' | 'negative' | 'neutral'
  polarityStrength?: number
  polarityConfidence?: number
}

export interface EmotionStatsResponse {
  [emotion: string]: {
    count: number
    avgIntensity: number
    totalIntensity: number
    lastRecorded?: Date
  }
}

// Chat API types
export interface CreateChatSessionRequest {
  emotion: EmotionType
}

export interface AddChatMessageRequest {
  sessionId: string
  content: string
  role: 'user' | 'assistant'
}
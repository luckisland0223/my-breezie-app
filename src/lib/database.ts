import type { EmotionRecord as EmotionRecordType, EmotionType } from '@/store/emotion'
import { prisma } from './prisma'

// Database utility functions for emotion records

export interface CreateEmotionRecordData {
  userId: string
  emotion: EmotionType
  behavioralImpact: number
  note: string
  recordType?: 'chat' | 'quick_check'
  conversationSummary?: string
  // AI Analysis fields
  actualEmotion?: EmotionType
  actualIntensity?: number
  emotionChanged?: boolean
  confidenceLevel?: number
  analysis?: string
  // Polarity Analysis fields
  polarity?: 'positive' | 'negative' | 'neutral'
  polarityStrength?: number
  polarityConfidence?: number
}

export interface UpdateEmotionRecordData {
  emotion?: EmotionType
  behavioralImpact?: number
  note?: string
  recordType?: 'chat' | 'quick_check'
  conversationSummary?: string
  // AI Analysis fields
  actualEmotion?: EmotionType
  actualIntensity?: number
  emotionChanged?: boolean
  confidenceLevel?: number
  analysis?: string
  // Polarity Analysis fields
  polarity?: 'positive' | 'negative' | 'neutral'
  polarityStrength?: number
  polarityConfidence?: number
}

// Create emotion record
export async function createEmotionRecord(data: CreateEmotionRecordData) {
  return await prisma.emotionRecord.create({
    data: {
      userId: data.userId,
      emotion: data.emotion,
      behavioralImpact: data.behavioralImpact,
      note: data.note,
      recordType: data.recordType || 'chat',
      conversationSummary: data.conversationSummary,
      actualEmotion: data.actualEmotion,
      actualIntensity: data.actualIntensity,
      emotionChanged: data.emotionChanged,
      confidenceLevel: data.confidenceLevel,
      analysis: data.analysis,
      polarity: data.polarity,
      polarityStrength: data.polarityStrength,
      polarityConfidence: data.polarityConfidence,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      }
    }
  })
}

// Get emotion records by user ID
export async function getEmotionRecordsByUserId(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    emotion?: EmotionType
    recordType?: 'chat' | 'quick_check'
    startDate?: Date
    endDate?: Date
  }
) {
  const where: any = { userId }
  
  if (options?.emotion) {
    where.emotion = options.emotion
  }
  
  if (options?.recordType) {
    where.recordType = options.recordType
  }
  
  if (options?.startDate || options?.endDate) {
    where.createdAt = {}
    if (options.startDate) {
      where.createdAt.gte = options.startDate
    }
    if (options.endDate) {
      where.createdAt.lte = options.endDate
    }
  }
  
  return await prisma.emotionRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit,
    skip: options?.offset,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      }
    }
  })
}

// Get emotion record by ID
export async function getEmotionRecordById(id: string, userId: string) {
  return await prisma.emotionRecord.findFirst({
    where: { id, userId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      }
    }
  })
}

// Update emotion record
export async function updateEmotionRecord(id: string, userId: string, data: UpdateEmotionRecordData) {
  return await prisma.emotionRecord.update({
    where: { id },
    data: {
      ...data,
      // Ensure only the owner can update
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      }
    }
  })
}

// Delete emotion record
export async function deleteEmotionRecord(id: string, userId: string) {
  return await prisma.emotionRecord.delete({
    where: { id, userId }
  })
}

// Get emotion statistics for a user
export async function getEmotionStatsByUserId(userId: string, days?: number) {
  const where: any = { userId }
  
  if (days) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    where.createdAt = { gte: startDate }
  }
  
  const records = await prisma.emotionRecord.findMany({
    where,
    select: {
      emotion: true,
      behavioralImpact: true,
      actualEmotion: true,
      actualIntensity: true,
      createdAt: true,
    }
  })
  
  // Calculate statistics
  const stats: { [key: string]: any } = {}
  
  records.forEach(record => {
    // Use AI-assessed emotion and intensity if available, otherwise use user's initial choice
    const emotion = record.actualEmotion || record.emotion
    const intensity = record.actualIntensity || record.behavioralImpact
    
    if (!stats[emotion]) {
      stats[emotion] = {
        count: 0,
        totalIntensity: 0,
        avgIntensity: 0,
        lastRecorded: record.createdAt
      }
    }
    
    stats[emotion].count += 1
    stats[emotion].totalIntensity += intensity
    stats[emotion].avgIntensity = Math.round((stats[emotion].totalIntensity / stats[emotion].count) * 10) / 10
    
    if (record.createdAt > stats[emotion].lastRecorded) {
      stats[emotion].lastRecorded = record.createdAt
    }
  })
  
  return stats
}

// Chat session functions
export async function createChatSession(userId: string, emotion: EmotionType) {
  return await prisma.chatSession.create({
    data: {
      userId,
      emotion,
    }
  })
}

export async function getChatSessionById(id: string, userId: string) {
  return await prisma.chatSession.findFirst({
    where: { id, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

export async function updateChatSession(id: string, userId: string, data: { endTime?: Date; messageCount?: number }) {
  return await prisma.chatSession.update({
    where: { id },
    data: {
      ...data,
      userId, // Ensure only the owner can update
    }
  })
}

export async function addChatMessage(sessionId: string, content: string, role: 'user' | 'assistant') {
  return await prisma.chatMessage.create({
    data: {
      sessionId,
      content,
      role,
    }
  })
}

// User functions
export async function createUser(email: string, username: string, passwordHash: string) {
  return await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      createdAt: true,
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  })
}

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username }
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      subscriptionTier: true,
      subscriptionExpiresAt: true,
      createdAt: true,
    }
  })
}
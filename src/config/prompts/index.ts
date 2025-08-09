/**
 * Prompt configuration management center
 * Unified export of all prompt configurations, providing version management and validation
 */

import { SYSTEM_PROMPT, buildSystemPrompt } from './system'
import { CONVERSATION_EXAMPLES, getExamplePrompt } from './examples'
import { EMOTION_CONTEXTS, getEmotionContext, getEmotionGuidance, getEmotionFocusAreas, getEmotionSupport, getComfortTechniques, getPracticalSuggestions } from './emotions'
import { FALLBACK_RESPONSES, getRandomFallback, getAllFallbackTypes } from './fallbacks'
import type { EmotionType } from '@/store/emotion'

// Configuration version management
export const PROMPT_CONFIG_VERSION = "1.0.0"
export const LAST_UPDATED = "2025-01-27"

// Configuration validation
interface ConfigValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validatePromptConfig(): ConfigValidation {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check system prompt
  if (!SYSTEM_PROMPT.core || SYSTEM_PROMPT.core.length < 50) {
    errors.push("System prompt core is too short or missing")
  }
  
  // Check number of examples
  if (CONVERSATION_EXAMPLES.naturalResponses.length < 3) {
    warnings.push("Consider adding more conversation examples")
  }
  
  // Check emotion contexts
  const requiredEmotions: EmotionType[] = ['Anger', 'Sadness', 'Joy', 'Fear', 'Other']
  for (const emotion of requiredEmotions) {
    if (!EMOTION_CONTEXTS.contexts[emotion]) {
      errors.push(`Missing emotion context for: ${emotion}`)
    }
  }
  
  // Check fallback responses
  if (FALLBACK_RESPONSES.general.length < 2) {
    errors.push("Not enough general fallback responses")
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Main prompt construction function - Enhanced for warmth and engagement
export function buildFullPrompt(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: Array<{role: 'user' | 'assistant' | 'system'; content: string}> = []
): string {
  // Enhanced system prompt with more caring personality
  const baseSystemPrompt = `你是Breezie，一个温暖体贴的AI情感陪伴者。你的使命是给用户真正的关爱和支持。

核心原则：
• 用温暖、关怀的语调回复，像一个真正在乎用户的好朋友
• 回复要有足够的内容（4-6句话），让用户感受到你的关爱和重视
• 主动关心用户的生活和感受，不要只是被动回应
• 提供具体的建议和支持，而不是空泛的安慰
• 使用温暖的表情符号增加亲近感（每次回复2-4个）
• 说中文，语气自然亲切`

  const emotionContext = getEmotionSupport(emotion)
  
  // Keep more conversation history for better context
  const filteredHistory = conversationHistory
    .filter(msg => msg.role !== 'system')
    .slice(-6) // Last 3 exchanges (6 messages)
  
  const conversationText = filteredHistory.length > 0 
    ? `\n对话历史: ${filteredHistory.map(msg => 
        `${msg.role === 'user' ? '用户' : '你'}: ${msg.content}`
      ).join(' | ')}\n`
    : ''
  
  // Detect conversation stage and add appropriate guidance
  const isFirstMessage = filteredHistory.length === 0
  const isFollowUpResponse = userMessage.includes('Now that the user has selected') && filteredHistory.length > 0
  const isShortUserMessage = userMessage.length < 20
  
  let specialGuidance = ''
  
  if (isFirstMessage) {
    specialGuidance = `\n特别指导：这是对话开始，要：
1. 温暖地欢迎用户，表达关心
2. 主动询问用户今天过得怎么样，发生了什么事情
3. 让用户感受到你真正关心他们的生活
4. 语气要亲切温暖，像老朋友一样`
  } else if (isShortUserMessage) {
    specialGuidance = `\n特别指导：用户回复较简短，要：
1. 主动深入了解用户的情况
2. 问一些关心的问题，比如今天发生了什么
3. 鼓励用户多分享，表达你的关心
4. 提供温暖的支持和理解`
  } else if (isFollowUpResponse) {
    specialGuidance = "\n特别指导：基于之前的对话，提供更深层的支持和新的关心角度。"
  }
  
  return `${baseSystemPrompt}\n${emotionContext}${conversationText}${specialGuidance}\n\n用户说: "${userMessage}"\n\n请作为Breezie温暖回复:`
}

// API configuration - Enhanced for warmer, longer responses
export const API_CONFIG = {
  model: 'gemini-1.5-flash',
  maxTokens: 800,  // Increased for longer, more caring responses
  temperature: 0.8,  // Higher temperature for more natural, warm responses
  topP: 0.9,
  topK: 40  // Higher topK for more diverse, engaging responses
} as const

// Export all functions
export {
  // System prompt
  SYSTEM_PROMPT,
  buildSystemPrompt,
  
  // Examples
  CONVERSATION_EXAMPLES, 
  getExamplePrompt,
  
  // Emotion contexts
  EMOTION_CONTEXTS,
  getEmotionContext,
  getEmotionGuidance,
  getEmotionFocusAreas,
  getEmotionSupport,
  getComfortTechniques,
  getPracticalSuggestions,
  
  // Fallback responses
  FALLBACK_RESPONSES,
  getRandomFallback,
  getAllFallbackTypes
}

  // Configuration information export
export const PROMPT_INFO = {
  version: PROMPT_CONFIG_VERSION,
  lastUpdated: LAST_UPDATED,
  components: {
    system: SYSTEM_PROMPT.version,
    examples: CONVERSATION_EXAMPLES.version,
    emotions: EMOTION_CONTEXTS.version,
    fallbacks: FALLBACK_RESPONSES.version
  }
} as const
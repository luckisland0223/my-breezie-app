/**
 * Prompt配置管理中心
 * 统一导出所有prompt配置，提供版本管理和验证
 */

import { SYSTEM_PROMPT, buildSystemPrompt } from './system'
import { CONVERSATION_EXAMPLES, getExamplePrompt } from './examples'
import { EMOTION_CONTEXTS, getEmotionContext, getEmotionGuidance, getEmotionFocusAreas, getEmotionSupport, getComfortTechniques, getPracticalSuggestions } from './emotions'
import { FALLBACK_RESPONSES, getRandomFallback, getAllFallbackTypes } from './fallbacks'
import type { EmotionType } from '@/store/emotion'

// 配置版本管理
export const PROMPT_CONFIG_VERSION = "1.0.0"
export const LAST_UPDATED = "2025-01-27"

// 配置验证
interface ConfigValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validatePromptConfig(): ConfigValidation {
  const errors: string[] = []
  const warnings: string[] = []
  
  // 检查系统prompt
  if (!SYSTEM_PROMPT.core || SYSTEM_PROMPT.core.length < 50) {
    errors.push("System prompt core is too short or missing")
  }
  
  // 检查示例数量
  if (CONVERSATION_EXAMPLES.naturalResponses.length < 3) {
    warnings.push("Consider adding more conversation examples")
  }
  
  // 检查emotion contexts
  const requiredEmotions: EmotionType[] = ['Anger', 'Sadness', 'Joy', 'Fear', 'Other']
  for (const emotion of requiredEmotions) {
    if (!EMOTION_CONTEXTS.contexts[emotion]) {
      errors.push(`Missing emotion context for: ${emotion}`)
    }
  }
  
  // 检查fallback responses
  if (FALLBACK_RESPONSES.general.length < 2) {
    errors.push("Not enough general fallback responses")
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// 主要的prompt构造函数
export function buildFullPrompt(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: Array<{role: 'user' | 'assistant' | 'system'; content: string}> = []
): string {
  const systemPrompt = buildSystemPrompt()
  const examplePrompt = getExamplePrompt()
  const emotionContext = getEmotionSupport(emotion)
  
  // 构造对话历史（过滤掉system消息）
  const filteredHistory = conversationHistory.filter(msg => msg.role !== 'system')
  const conversationText = filteredHistory.length > 0 
    ? `\n\nPrevious conversation:\n${filteredHistory.map(msg => 
        `${msg.role === 'user' ? 'Them' : 'You'}: ${msg.content}`
      ).join('\n')}\n\n`
    : '\n\n'
  
  // 检测是否为情绪选择后的后续回复
  const isFollowUpResponse = userMessage.includes('Now that the user has selected') && filteredHistory.length > 0
  
  const followUpGuidance = isFollowUpResponse 
    ? `\n\nIMPORTANT: This is a follow-up response after the user selected an emotion. You have already had a conversation with them (see above). Now:
- Build naturally on what you already discussed
- Don't repeat the same questions or observations
- Go deeper into their emotional experience
- Offer new insights, different questions, or fresh support
- Show that you remember and understand their story`
    : ''
  
  return `${systemPrompt}\n\n${examplePrompt}\n\n${emotionContext}${conversationText}${followUpGuidance}\n\nThey just said: "${userMessage}"\n\nRespond naturally as their caring friend Breezie:`
}

// API配置
export const API_CONFIG = {
  model: 'gemini-1.5-flash',  // 更新为可用的模型
  maxTokens: 600,
  temperature: 0.9,
  topP: 0.8,
  topK: 40
} as const

// 导出所有功能
export {
  // 系统prompt
  SYSTEM_PROMPT,
  buildSystemPrompt,
  
  // 示例
  CONVERSATION_EXAMPLES, 
  getExamplePrompt,
  
  // 情绪上下文
  EMOTION_CONTEXTS,
  getEmotionContext,
  getEmotionGuidance,
  getEmotionFocusAreas,
  getEmotionSupport,
  getComfortTechniques,
  getPracticalSuggestions,
  
  // Fallback回复
  FALLBACK_RESPONSES,
  getRandomFallback,
  getAllFallbackTypes
}

// 配置信息导出
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
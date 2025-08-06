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

// Main prompt construction function - Optimized for speed
export function buildFullPrompt(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: Array<{role: 'user' | 'assistant' | 'system'; content: string}> = []
): string {
  // Use shorter, more focused prompts for better performance
  const systemPrompt = "You are Breezie, a caring AI emotional wellness companion. Respond warmly and supportively in 2-3 sentences."
  const emotionContext = getEmotionSupport(emotion)
  
  // Limit conversation history to last 2 exchanges for speed
  const filteredHistory = conversationHistory
    .filter(msg => msg.role !== 'system')
    .slice(-4) // Only last 2 exchanges (4 messages)
  
  const conversationText = filteredHistory.length > 0 
    ? `\nRecent context: ${filteredHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
      ).join(' | ')}\n`
    : ''
  
  // Detect if this is a follow-up response
  const isFollowUpResponse = userMessage.includes('Now that the user has selected') && filteredHistory.length > 0
  
  const followUpGuidance = isFollowUpResponse 
    ? "\nBuild on previous conversation, offer new support."
    : ''
  
  return `${systemPrompt}\n${emotionContext}${conversationText}${followUpGuidance}\n\nUser: "${userMessage}"\n\nBreezie:`
}

// API configuration - Upgraded to Gemini 2.0 Flash
export const API_CONFIG = {
  model: 'gemini-2.0-flash',  // Upgraded to faster Gemini 2.0 Flash
  maxTokens: 400,  // Optimized for faster responses
  temperature: 0.7,  // Lower temperature for faster processing
  topP: 0.9,
  topK: 20  // Lower topK for faster processing
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
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
  const baseSystemPrompt = `You are Breezie, a warm and caring AI emotional wellness companion. Your mission is to provide genuine care and support to users.

Core Principles:
• Respond with a warm, caring tone like a friend who truly cares about the user
• Provide substantial responses (4-6 sentences) so users feel your care and attention
• Actively show interest in the user's life and feelings, don't just passively respond
• Offer specific advice and support, not empty comfort
• Use warm emojis to add closeness (2-4 emojis per response)
• Speak naturally and warmly`

  const emotionContext = getEmotionSupport(emotion)
  
  // Keep more conversation history for better context
  const filteredHistory = conversationHistory
    .filter(msg => msg.role !== 'system')
    .slice(-6) // Last 3 exchanges (6 messages)
  
  const conversationText = filteredHistory.length > 0 
    ? `\nConversation history: ${filteredHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}`
      ).join(' | ')}\n`
    : ''
  
  // Detect conversation stage and add appropriate guidance
  const isFirstMessage = filteredHistory.length === 0
  const isFollowUpResponse = userMessage.includes('Now that the user has selected') && filteredHistory.length > 0
  const isShortUserMessage = userMessage.length < 20
  
  let specialGuidance = ''
  
  if (isFirstMessage) {
    specialGuidance = `\nSpecial guidance: This is the conversation start, you should:
1. Warmly welcome the user and express care
2. Actively ask how their day is going, what happened today
3. Make the user feel you genuinely care about their life
4. Use a warm, friendly tone like an old friend`
  } else if (isShortUserMessage) {
    specialGuidance = `\nSpecial guidance: User gave a short reply, you should:
1. Actively try to understand the user's situation better
2. Ask caring questions like what happened today
3. Encourage user to share more, express your care
4. Provide warm support and understanding`
  } else if (isFollowUpResponse) {
    specialGuidance = "\nSpecial guidance: Based on previous conversation, provide deeper support and new caring perspectives."
  }
  
  return `${baseSystemPrompt}\n${emotionContext}${conversationText}${specialGuidance}\n\nUser said: "${userMessage}"\n\nPlease respond as Breezie with warmth:`
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
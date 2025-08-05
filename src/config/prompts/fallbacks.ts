/**
 * Fallback回复配置
 * 管理各种错误情况下的备用回复
 */

export const FALLBACK_RESPONSES = {
  version: "1.0.0",
  lastUpdated: "2025-01-27",
  
  apiError: [
    "I'm having trouble connecting right now, but I really want to hear what you have to say. Can you tell me more?",
    "Sorry, I missed that. What's going on with you today?", 
    "I'm here and listening. What's on your mind?",
    "Let me try again - what would you like to talk about?"
  ],
  
  chatError: [
    "I want to make sure I understand what you're going through. Can you tell me a bit more about what's happening?",
    "I'm having some trouble right now, but I'm still here with you. What would you like to share?",
    "Sorry about that glitch. I'm listening - what's going on?"
  ],
  
  emotionSelectionError: [
    "That makes sense - I'd love to understand more about what you're experiencing. What's been the most challenging part?",
    "I can hear that there's a lot going on for you. Tell me more about what you're feeling.",
    "It sounds like you're going through something important. I'm here to listen."
  ],
  
  general: [
    "I'm here for you. What's happening?",
    "Tell me what's on your mind.",
    "I'm listening. What would you like to talk about?",
    "What's going on with you today?"
  ]
} as const

export function getRandomFallback(type: keyof typeof FALLBACK_RESPONSES): string {
  const responses = FALLBACK_RESPONSES[type]
  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex] || FALLBACK_RESPONSES.general[0]
}

export function getAllFallbackTypes(): Array<keyof typeof FALLBACK_RESPONSES> {
  return Object.keys(FALLBACK_RESPONSES) as Array<keyof typeof FALLBACK_RESPONSES>
}
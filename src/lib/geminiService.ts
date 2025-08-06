import type { EmotionType } from '@/store/emotion'
import { 
  buildFullPrompt, 
  getRandomFallback, 
  API_CONFIG,
  validatePromptConfig,
  PROMPT_INFO 
} from '@/config/prompts'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GeminiResponse {
  content: string
  model: string
}

// Gemini API configuration
const GEMINI_CONFIG = {
  model: API_CONFIG.model,
  baseURL: `https://generativelanguage.googleapis.com/v1beta/models/${API_CONFIG.model}:generateContent`,
  maxTokens: API_CONFIG.maxTokens,
  temperature: API_CONFIG.temperature
}

// Validate configuration on service startup
const configValidation = validatePromptConfig()
if (!configValidation.isValid) {

  if (configValidation.warnings.length > 0) {
  
  }
} else {
  
}

export async function getGeminiResponse(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: ChatMessage[] = [],
  apiKey: string
): Promise<string> {
  try {
    // Use new prompt construction system
    const fullPrompt = buildFullPrompt(userMessage, emotion, conversationHistory)
    
    // Construct Gemini API request
    const messages = [{
      role: 'user',
      parts: [{ text: fullPrompt }]
    }]

    const requestBody = {
      contents: messages,
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
        topP: API_CONFIG.topP,
        topK: API_CONFIG.topK
      }
    }

    // Add timeout and retry logic for better performance
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    let response: Response
    try {
      response = await fetch(`${GEMINI_CONFIG.baseURL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - API response too slow')
      }
      throw error
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()


    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content.parts[0].text
      return content.trim()
    } else {

      throw new Error('Invalid response format from Gemini API')
    }

  } catch (error) {
    console.error('Gemini API error:', error)
    
    // Return the actual error information instead of hiding it
    return `I encountered an error while processing your message. Error details: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or let me know if you'd like me to explain what happened.`
  }
}
import type { EmotionType } from '@/store/emotion'
import { 
  buildFullPrompt, 
  getRandomFallback, 
  API_CONFIG,
  getTokensForEngagement,
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
  apiKey: string,
  engagementLevel?: 'high' | 'medium' | 'normal',
  responseInstructions?: string
): Promise<string> {
  try {
    // Use new prompt construction system with engagement awareness
    let fullPrompt = buildFullPrompt(userMessage, emotion, conversationHistory)
    
    // Add engagement-specific instructions if provided
    if (responseInstructions && engagementLevel) {
      fullPrompt += `\n\nIMPORTANT RESPONSE GUIDANCE: ${responseInstructions}`
    }
    
    // Construct Gemini API request
    const messages = [{
      role: 'user',
      parts: [{ text: fullPrompt }]
    }]

    // Dynamic token allocation based on engagement level
    const dynamicTokens = getTokensForEngagement(
      engagementLevel || 'normal', 
      userMessage.length
    )

    const requestBody = {
      contents: messages,
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: dynamicTokens,
        topP: API_CONFIG.topP,
        topK: API_CONFIG.topK
      }
    }

    // Add timeout and retry logic for better performance
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    let response: Response
    try {
      response = await fetch(`${GEMINI_CONFIG.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
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

    
    // Use configured fallback response
    return getRandomFallback('apiError')
  }
}
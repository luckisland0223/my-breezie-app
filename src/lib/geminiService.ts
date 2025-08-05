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

// 在服务启动时验证配置
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
    // 使用新的prompt构造系统
    const fullPrompt = buildFullPrompt(userMessage, emotion, conversationHistory)
    
    // 构造Gemini API请求
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

    const response = await fetch(`${GEMINI_CONFIG.baseURL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

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

    
    // 使用配置化的fallback回复
    return getRandomFallback('apiError')
  }
}
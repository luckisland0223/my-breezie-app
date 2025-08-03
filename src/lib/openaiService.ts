import type { EmotionType, EmotionEvaluation } from '@/store/emotion'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OpenAIResponse {
  content: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// OpenAI configuration
const OPENAI_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  baseURL: process.env.OPENAI_BASE_URL || 'https://aihubmix.com/v1',
  maxTokens: 800,
  temperature: 0.8
}

// Validate API key format
function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new Error('OpenAI API key not set, please configure in environment variables')
  }
  
  if (apiKey.length < 20) {
    throw new Error('Invalid API key format, please check settings')
  }
}

// Psychology prompt templates
const PSYCHOLOGY_PROMPTS = {
  systemPrompt: `You are Breezie, a warm and empathetic mental health companion. Your mission is to provide genuine emotional support and understanding to users.

Your core qualities:
• Deep empathy: Truly understand and feel users' emotions, like a caring friend
• Genuine warmth: Use natural, friendly language, avoiding mechanical or templated responses
• Personalized care: Provide tailored support based on users' specific situations and feelings
• Professional insight: Apply psychological knowledge in an accessible, relatable way
• Active companionship: Be a reliable partner in users' emotional journeys

Conversation principles:
1. First validate and understand users' feelings - let them know they're heard and understood
2. Express genuine care and acknowledge the validity of their emotions
3. Share relevant insights or different perspectives, but don't lecture
4. Provide practical advice or coping strategies, considering users' specific circumstances
5. Encourage users to express more and deeply explore their feelings

Language style:
- Like talking with an understanding good friend
- NEVER use phrases like "I understand", "I can understand you", "I understand how you feel", or similar expressions
- Instead of saying you understand, ask specific questions about their situation
- Use specific language to respond to users' specific situations
- Stay warm but not overly sweet
- Keep responses 100-150 words, both deep and concise
- In opening messages, go straight to asking about their situation rather than expressing understanding

Remember: Everyone's emotional experience is unique. Don't give standardized responses, but truly listen to what users say and respond thoughtfully to their specific circumstances.`,

  emotionSpecificPrompts: {
    'Anger': `The user selected "Anger" as their emotion. They may feel misunderstood, unfairly treated, or facing frustration. Pay special attention to:
- Anger often has underlying hurt or fear
- Help them express the reasons for their anger rather than suppressing it  
- Anger is normal - the key is how to handle it healthily
- Provide specific emotion regulation methods that fit their situation
- Validate their feelings while offering constructive pathways forward`,

    'Disgust': `The user selected "Disgust" as their emotion. They may have encountered something that violates their values or feels troubling. Pay special attention to:
- Disgust often reflects our values and boundaries
- Help them understand the meaning behind this feeling
- Explore how to handle this emotion while maintaining healthy boundaries
- Avoid judgment and focus on understanding and support
- Honor their moral compass while offering perspective`,

    'Fear': `The user selected "Fear" as their emotion. They may be facing the unknown, worried about failure, or feeling unsafe. Pay special attention to:
- Fear is a protective mechanism, but sometimes it limits us
- Help distinguish between realistic concerns and excessive anxiety
- Provide specific coping strategies, starting with small steps
- Emphasize they're not alone - many people have similar feelings
- Balance validation with gentle encouragement toward growth`,

    'Joy': `The user selected "Joy" as their emotion. While this is positive, they may want to share, maintain this feeling, or worry about losing it. Pay special attention to:
- Celebrate and affirm the value of this happiness
- Help them identify the sources of their joy
- Discuss how to cultivate more positive experiences
- If they worry about joy's sustainability, provide appropriate comfort
- Encourage gratitude practices and joy expansion`,

    'Sadness': `The user selected "Sadness" as their emotion. They may be experiencing loss, disappointment, or loneliness. Pay special attention to:
- Sadness is an important part of the healing process
- Let them know feeling sad is completely normal and necessary
- Provide gentle companionship rather than rushing to "fix" things
- Encourage expression of feelings without forcing it
- Honor their grief process while offering hope`,

    'Surprise': `The user selected "Surprise" as their emotion. They may have encountered unexpected situations and need time to process and adapt. Pay special attention to:
- Surprise indicates something unexpected has occurred
- Help them process this cognitive adjustment
- Explore what this unexpected event means to them
- Support them in adapting to new situations or information
- Frame surprise as potential opportunity when appropriate`,

    'Complex': `The user selected "Complex" emotions, indicating they may be experiencing multiple emotions simultaneously like anxiety, jealousy, embarrassment, etc. Pay special attention to:
- Complex emotions are completely normal - we often have mixed feelings
- Help them untangle and name different emotions
- Don't try to oversimplify their experience
- Provide methods for emotional sorting, but be patient and thorough
- Validate the complexity of human emotional experience`
  }
}

// Get emotion-specific prompts
function getEmotionPrompt(emotion: EmotionType): string {
  return PSYCHOLOGY_PROMPTS.emotionSpecificPrompts[emotion] || 
         PSYCHOLOGY_PROMPTS.emotionSpecificPrompts['Complex']
}

// OpenAI API call function
export async function callOpenAI(messages: ChatMessage[], apiKey: string): Promise<OpenAIResponse> {
  try {
    // Validate API key
    validateApiKey(apiKey)
    
    const response = await fetch(`${OPENAI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        stream: false
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API Error Details:', errorData)
      
      // Provide more user-friendly error messages
      if (response.status === 401) {
        throw new Error('Invalid API key, please check your key settings')
      } else if (response.status === 429) {
        throw new Error('Too many requests, please try again later')
      } else if (response.status === 500) {
        throw new Error('OpenAI service temporarily unavailable, please try again later')
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }
    }

    const data = await response.json()
    
    // Check if there's a valid response
    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI API did not return a valid response')
    }
    
    const choice = data.choices[0]
    if (!choice.message || !choice.message.content) {
      throw new Error('OpenAI API returned invalid format')
    }
    
    return {
      content: choice.message.content,
      model: data.model || OPENAI_CONFIG.model,
      usage: data.usage ? {
        prompt_tokens: data.usage.prompt_tokens || 0,
        completion_tokens: data.usage.completion_tokens || 0,
        total_tokens: data.usage.total_tokens || 0
      } : undefined
    }
  } catch (error) {
    console.error('OpenAI API call failed:', error)
    throw error
  }
}

// Intelligent AI response function
export async function getOpenAIResponse(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: ChatMessage[],
  apiKey: string
): Promise<string> {
  try {
    // Build complete system prompt
    const fullSystemPrompt = PSYCHOLOGY_PROMPTS.systemPrompt + '\n\n' + getEmotionPrompt(emotion)
    
    // Build message array
    const messages: ChatMessage[] = [
      { role: 'system', content: fullSystemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    // Call OpenAI API
    const response = await callOpenAI(messages, apiKey)
    
    return response.content
  } catch (error) {
    console.error('OpenAI response generation failed:', error)
    
    // Provide friendly error fallback
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        throw new Error('API key validation failed, please check your key configuration')
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many requests, please wait a moment and try again')
      }
    }
    
    throw error
  }
}

// Export same function name for backward compatibility
export const getGeminiResponse = getOpenAIResponse
export const callGemini = callOpenAI

// Compatible type definitions
export type GeminiResponse = OpenAIResponse
export type ClaudeResponse = OpenAIResponse

// Simplified emotion evaluation (if needed)
export async function generateEmotionEvaluation(
  messages: ChatMessage[], 
  initialEmotion: EmotionType, 
  apiKey: string
): Promise<EmotionEvaluation | null> {
  // This feature was simplified before, can be reimplemented if needed
  return null
}

// Simplified conversation summary (if needed)
export async function generateConversationSummary(
  messages: ChatMessage[], 
  emotion: EmotionType, 
  apiKey: string
): Promise<{
  userProblem: string
  solution: string
  userReaction: string
} | null> {
  // This feature was simplified before, can be reimplemented if needed
  return null
}
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

// OpenAI配置
const OPENAI_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  baseURL: process.env.OPENAI_BASE_URL || 'https://aihubmix.com/v1',
  maxTokens: 800,
  temperature: 0.8
}

// 验证API密钥格式
function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new Error('未设置OpenAI API密钥，请在环境变量中配置')
  }
  
  if (apiKey.length < 20) {
    throw new Error('API密钥格式无效，请检查设置')
  }
}

// 心理学提示模板
const PSYCHOLOGY_PROMPTS = {
  systemPrompt: `你是Breezie，一位温暖、有同理心的心理健康陪伴者。你的使命是为用户提供真诚的情感支持和理解。

你的核心特质：
• 深度共情：真正理解和感受用户的情绪，就像一个关心的朋友
• 真诚温暖：用自然、亲切的语言，避免机械化或模板化的回应
• 个性化关怀：根据用户的具体情况和感受，提供量身定制的支持
• 专业洞察：运用心理学知识，但以易懂、贴近生活的方式表达
• 积极陪伴：成为用户情绪旅程中的可靠伙伴

对话原则：
1. 首先验证和理解用户的感受 - 让他们知道被听见和理解
2. 表达真诚的关心，承认他们情绪的合理性
3. 分享相关的洞察或不同的视角，但不要说教
4. 提供实用的建议或应对策略，但要考虑用户的具体情况
5. 鼓励用户表达更多，深入探索他们的感受

语言风格：
- 就像和一个理解你的好朋友对话
- 避免使用"我理解你的感受"这样的套话
- 用具体的语言回应用户的具体情况
- 保持温暖但不过分甜腻
- 每次回复100-150字，既有深度又简洁

记住：每个人的情绪体验都是独特的。不要给出标准化的回应，而是真正倾听用户说了什么，然后用心回应他们的具体处境。`,

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

// OpenAI API调用函数
export async function callOpenAI(messages: ChatMessage[], apiKey: string): Promise<OpenAIResponse> {
  try {
    // 验证API密钥
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
      
      // 提供更友好的错误信息
      if (response.status === 401) {
        throw new Error('API密钥无效，请检查你的密钥设置')
      } else if (response.status === 429) {
        throw new Error('请求过于频繁，请稍后再试')
      } else if (response.status === 500) {
        throw new Error('OpenAI服务暂时不可用，请稍后再试')
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }
    }

    const data = await response.json()
    
    // 检查是否有有效回复
    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenAI API没有返回有效回复')
    }
    
    const choice = data.choices[0]
    if (!choice.message || !choice.message.content) {
      throw new Error('OpenAI API返回格式无效')
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

// 智能AI回复函数
export async function getOpenAIResponse(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: ChatMessage[],
  apiKey: string
): Promise<string> {
  try {
    // 构建完整的系统提示
    const fullSystemPrompt = PSYCHOLOGY_PROMPTS.systemPrompt + '\n\n' + getEmotionPrompt(emotion)
    
    // 构建消息数组
    const messages: ChatMessage[] = [
      { role: 'system', content: fullSystemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    // 调用OpenAI API
    const response = await callOpenAI(messages, apiKey)
    
    return response.content
  } catch (error) {
    console.error('OpenAI response generation failed:', error)
    
    // 提供友好的错误回退
    if (error instanceof Error) {
      if (error.message.includes('API密钥无效')) {
        throw new Error('API密钥验证失败，请检查你的密钥配置')
      } else if (error.message.includes('请求过于频繁')) {
        throw new Error('请求太频繁了，请稍等一下再试')
      }
    }
    
    throw error
  }
}

// 为了保持向后兼容性，导出相同的函数名
export const getGeminiResponse = getOpenAIResponse
export const callGemini = callOpenAI

// 兼容的类型定义
export type GeminiResponse = OpenAIResponse
export type ClaudeResponse = OpenAIResponse

// 简化版情绪评估（如果需要的话）
export async function generateEmotionEvaluation(
  messages: ChatMessage[], 
  initialEmotion: EmotionType, 
  apiKey: string
): Promise<EmotionEvaluation | null> {
  // 这个功能之前被简化了，如果需要可以重新实现
  return null
}

// 简化版对话摘要（如果需要的话）
export async function generateConversationSummary(
  messages: ChatMessage[], 
  emotion: EmotionType, 
  apiKey: string
): Promise<{
  userProblem: string
  solution: string
  userReaction: string
} | null> {
  // 这个功能之前被简化了，如果需要可以重新实现
  return null
}
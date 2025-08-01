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
    '愤怒': `用户选择了"愤怒"这个情绪。他们可能感到被误解、不公平对待，或者面临挫折。要特别关注：
- 愤怒背后通常有受伤或恐惧
- 帮助他们表达愤怒的原因，而不是压抑
- 愤怒是正常的，关键是如何健康地处理
- 提供具体的情绪调节方法，但要贴合他们的情况`,

    '厌恶': `用户选择了"厌恶"情绪。他们可能遇到了违背价值观的事情，或感到被某种情况困扰。要特别关注：
- 厌恶往往反映了我们的价值观和界限
- 帮助他们理解这种感受的意义
- 探讨如何在保持界限的同时处理这种情绪
- 避免评判，专注于理解和支持`,

    '恐惧': `用户选择了"恐惧"情绪。他们可能面临未知、担心失败，或感到不安全。要特别关注：
- 恐惧是保护机制，但有时会限制我们
- 帮助区分现实的担忧和过度的焦虑
- 提供具体的应对策略，从小步骤开始
- 强调他们并不孤单，很多人都有类似感受`,

    '快乐': `用户选择了"快乐"情绪。虽然是积极情绪，但他们可能想分享、保持这种感受，或担心失去它。要特别关注：
- 庆祝和确认这份快乐的价值
- 帮助他们识别快乐的来源
- 讨论如何培养更多的积极体验
- 如果他们担心快乐的持续性，给予适当的安慰`,

    '悲伤': `用户选择了"悲伤"情绪。他们可能经历失去、失望，或感到孤独。要特别关注：
- 悲伤是治愈过程的重要部分
- 让他们知道感到悲伤是完全正常的
- 提供温柔的陪伴，而不是急于"修复"
- 鼓励他们表达感受，但不要强迫`,

    '惊讶': `用户选择了"惊讶"情绪。他们可能遇到了意外的情况，需要时间处理和适应。要特别关注：
- 惊讶表明发生了预期之外的事情
- 帮助他们处理这种认知上的调整
- 探讨这个意外对他们意味着什么
- 支持他们适应新的情况或信息`,

    '复杂': `用户选择了"复杂"情绪，表明他们可能同时体验多种情绪，如焦虑、嫉妒、尴尬等。要特别关注：
- 复杂情绪是完全正常的，很多情况下我们都会有混合感受
- 帮助他们梳理和命名不同的情绪
- 不要试图简化他们的体验
- 提供情绪整理的方法，但要耐心和细致`
  }
}

// 获取情绪特定的提示
function getEmotionPrompt(emotion: EmotionType): string {
  return PSYCHOLOGY_PROMPTS.emotionSpecificPrompts[emotion] || 
         PSYCHOLOGY_PROMPTS.emotionSpecificPrompts['复杂']
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
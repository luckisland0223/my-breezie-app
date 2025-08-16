import { GoogleGenerativeAI } from '@google/generative-ai';

// 通用系统提示词
const SYSTEM_PROMPT = `你是Breezie，一个充满温暖和同理心的情绪疏导AI助手。你就像用户最信任的朋友，总是在他们需要的时候给予支持和理解。

💝 你的核心特质：
- 温暖如春风，让每个人都感受到被关爱
- 深深的同理心，能真正理解和感受用户的情绪
- 绝不评判，接纳每一种情绪的存在
- 像最好的朋友一样，既专业又亲切
- 善于倾听，用心感受每一个字背后的情感
- 提供温柔而实用的建议，就像拥抱一样给人力量

🌟 交流的艺术：
1. 用最温柔的语言回应，让用户感受到被珍视
2. 通过温暖的开放性问题，陪伴用户探索内心
3. 分享具体而温暖的建议，像朋友间的贴心叮嘱
4. 及时给予肯定和鼓励，发现用户的每一个闪光点
5. 尊重并接纳所有情绪，告诉用户"感受到这些都是正常的"
6. 使用温暖、自然的中文，像面对面聊天一样亲切
7. 适当使用温暖的emoji，但不要过度使用
8. 记住每个人都在努力生活，给予最大的理解和支持

💙 特别的温暖：
- 当用户开心时，真诚地为他们感到高兴
- 当用户难过时，给予最温柔的安慰和陪伴
- 当用户焦虑时，提供最实用的放松技巧
- 当用户困惑时，耐心地帮助他们理清思路
- 始终记住：你的存在就是为了让用户感受到温暖和希望

🌸 重要提醒：
你是陪伴者和支持者，不是治疗师。如果用户表达严重的心理健康问题，请温柔地建议他们寻求专业帮助，并强调这是一种勇敢和智慧的选择。

记住：每一次对话都是一次心灵的拥抱，让用户在离开时比到来时感觉更好一些。`;

// 情绪分析提示词
const EMOTION_ANALYSIS_PROMPT = `请分析以下文本的情绪状态，并以JSON格式返回结果：

文本："{{MESSAGE}}"

可识别的情绪类型包括：

积极情绪：狂喜、愉悦、开心、满足、感恩、兴奋、自豪、充满希望、平静、自信
中性情绪：冷静、一般、沉思、好奇、疲惫、无聊、冷漠
消极情绪：失望、难过、孤独、担心、焦虑、压力、沮丧、愤怒、不知所措、抑郁、绝望
复杂情绪：怀念、嫉妒、内疚、尴尬、困惑、惊讶、震惊、解脱

请返回包含以下字段的JSON：
{
  "emotion": "主要情绪（从上述情绪类型中选择最匹配的）",
  "confidence": 置信度(0-1之间的数字),
  "suggestions": ["针对该情绪的建议1", "针对该情绪的建议2", "针对该情绪的建议3"]
}

只返回JSON，不要其他文字。`;

// 支持的AI模型类型
export type AIModel = 'gemini' | 'deepseek';

// AI模型配置
export const AI_MODELS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google的先进AI模型，擅长理解和生成自然语言',
    icon: '🧠',
    apiKeyPlaceholder: '请输入Google Gemini API密钥',
  },
  deepseek: {
    name: 'DeepSeek',
    description: '深度求索的强大AI模型，在中文理解方面表现优异',
    icon: '🔍',
    apiKeyPlaceholder: '请输入DeepSeek API密钥',
  },
} as const;

// 通用AI服务接口
export interface AIServiceInterface {
  generateResponse(message: string, conversationHistory: Array<{role: string, content: string}>): Promise<string>;
  analyzeEmotion(message: string): Promise<{ emotion: string; confidence: number; suggestions: string[] }>;
}

// Gemini服务实现
class GeminiService implements AIServiceInterface {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey: string) {
    this.initialize(apiKey);
  }

  private initialize(apiKey: string) {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
      });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw new Error('Gemini API密钥无效或网络连接失败');
    }
  }

  async generateResponse(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    if (!this.model) {
      throw new Error('请先设置API密钥');
    }

    try {
      // 构建对话历史
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = this.model.startChat({
        history: history,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('AI响应生成失败，请稍后重试');
    }
  }

  async analyzeEmotion(message: string): Promise<{ emotion: string; confidence: number; suggestions: string[] }> {
    if (!this.model) {
      throw new Error('请先设置API密钥');
    }

    const emotionPrompt = EMOTION_ANALYSIS_PROMPT.replace('{{MESSAGE}}', message);

    try {
      const result = await this.model.generateContent(emotionPrompt);
      const response = await result.response;
      const text = response.text();
      
      // 尝试解析JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果解析失败，返回默认值
      return {
        emotion: "未知",
        confidence: 0.5,
        suggestions: ["继续和我分享你的感受", "深呼吸，放松一下", "关注当下的感受"]
      };
    } catch (error) {
      console.error('Emotion analysis error:', error);
      return {
        emotion: "未知",
        confidence: 0.5,
        suggestions: ["继续和我分享你的感受", "深呼吸，放松一下", "关注当下的感受"]
      };
    }
  }
}

// DeepSeek服务实现
class DeepSeekService implements AIServiceInterface {
  private apiKey: string;
  private baseURL = 'https://api.deepseek.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      // 构建消息历史
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '抱歉，我暂时无法回应，请稍后再试。';
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error('AI响应生成失败，请稍后重试');
    }
  }

  async analyzeEmotion(message: string): Promise<{ emotion: string; confidence: number; suggestions: string[] }> {
    try {
      const emotionPrompt = EMOTION_ANALYSIS_PROMPT.replace('{{MESSAGE}}', message);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的情绪分析助手，请严格按照要求返回JSON格式的结果。' },
            { role: 'user', content: emotionPrompt }
          ],
          temperature: 0.3,
          max_tokens: 512,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content || '';
      
      // 尝试解析JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果解析失败，返回默认值
      return {
        emotion: "未知",
        confidence: 0.5,
        suggestions: ["继续和我分享你的感受", "深呼吸，放松一下", "关注当下的感受"]
      };
    } catch (error) {
      console.error('DeepSeek emotion analysis error:', error);
      return {
        emotion: "未知",
        confidence: 0.5,
        suggestions: ["继续和我分享你的感受", "深呼吸，放松一下", "关注当下的感受"]
      };
    }
  }
}

// 从环境变量获取API密钥
import { env } from "@/env";

// AI服务工厂
export class AIServiceFactory {
  static createService(model: AIModel): AIServiceInterface {
    // 从环境变量获取API密钥
    const apiKey = model === 'gemini' 
      ? env.NEXT_PUBLIC_GEMINI_API_KEY 
      : env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      throw new Error(`请在环境变量中配置 ${AI_MODELS[model].name} 的API密钥`);
    }
    
    switch (model) {
      case 'gemini':
        return new GeminiService(apiKey);
      case 'deepseek':
        return new DeepSeekService(apiKey);
      default:
        throw new Error(`不支持的AI模型: ${model}`);
    }
  }
}

// 向后兼容的GeminiService导出
export { GeminiService };

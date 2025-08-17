import { GoogleGenerativeAI } from '@google/generative-ai';

// 情绪疏导AI系统提示词 - 基于CBT理论的专业陪伴
export const SYSTEM_PROMPT = `你是Breezie，一个专业的情绪陪伴AI，基于认知行为疗法(CBT)理论为用户提供情绪疏导服务。

⚠️ 重要规则：
- 只提供纯粹的对话内容，绝对不要包含任何括号内的动作描述或语气说明
- 避免涉及政治、宗教、敏感社会议题等争议性话题
- 遇到敏感话题时，礼貌转移到情绪层面："我更关心这些对你情绪的影响"

🎯 核心原则：
1. **问候处理**：对于简单问好，简洁回应并直接询问情绪状态
   - "你好！最近心情怎么样？"
   - "嗨！有什么情绪困扰需要聊聊吗？"

2. **CBT双阶段疏导法**：
   **第一阶段 - 感性安慰**（用户情绪低落时）：
   - 情绪验证："你的感受完全可以理解"
   - 共情陪伴："我能感受到你的痛苦，你不是一个人"
   - 温暖支持："这种情况确实很难，任何人都会难过"
   
   **第二阶段 - 理性分析**（情绪稳定后）：
   - 认知重构："让我们看看这种想法是否准确"
   - 问题分析："我们来分析一下具体原因"
   - 解决方案："有几个实用的方法可以尝试"

3. **表达风格**：
   - 温暖但专业，口语化但不失深度
   - 用生活化语言解释心理概念
   - 避免教条式说教，像朋友般交流

4. **安全边界**：
   - 遇到严重心理健康风险时，建议寻求专业帮助
   - 不编造具体案例或个人经历
   - 保持AI身份的诚实透明

🧠 CBT技巧应用：
- **认知重构**："这种想法可能不太准确，我们换个角度看看"
- **行为激活**："也许我们可以尝试一些具体的行动"
- **正念技巧**："先关注当下的感受，深呼吸一下"
- **问题解决**："我们把这个问题分解成几个小步骤"

💝 情绪分层响应：
- **焦虑**：先安抚→分析担忧源头→提供应对策略
- **抑郁**：先理解→识别负面思维→激活积极行为
- **愤怒**：先验证→分析触发因素→教授情绪管理
- **悲伤**：先陪伴→处理失落感→寻找意义重建

记住：你的目标是通过CBT理论帮助用户识别和改变不良认知模式，同时提供温暖的情感支持。保持专业、简洁、有效。`;

// 情绪分析提示词 - 简洁专业版
export const EMOTION_ANALYSIS_PROMPT = `分析以下文本的情绪状态：

文本："{{MESSAGE}}"

基于CBT理论，返回JSON格式：
{
  "emotion": "主要情绪",
  "basicEmotion": "基本情绪类别（joy/fear/anger/sadness/neutral等）",
  "intensity": "强度（high/medium/low）",
  "confidence": 置信度(0-1),
  "suggestions": [
    "CBT认知重构建议",
    "情绪调节策略",
    "具体行动建议"
  ],
  "professionalNote": "是否需要专业帮助"
}

⚠️ 如检测到自伤、自杀风险，必须在professionalNote中建议寻求专业帮助。
只返回JSON。`;

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
          temperature: 0.8, // 略微提高创造性但保持连贯性
          topK: 15, // 进一步减少以提高速度
          topP: 0.85, // 优化采样策略
          maxOutputTokens: 400, // 适度减少输出长度
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
          temperature: 0.8,
          max_tokens: 400, // 优化输出长度以提高速度
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
    // 从服务器端环境变量获取API密钥
    const apiKey = model === 'gemini' 
      ? env.GEMINI_API_KEY 
      : env.DEEPSEEK_API_KEY;
    
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

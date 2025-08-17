import { GoogleGenerativeAI } from '@google/generative-ai';

// 基于心理学理论的专业系统提示词 - 导出供其他模块使用
export const SYSTEM_PROMPT = `你是Breezie，一个基于科学心理学理论的专业情绪疏导AI助手。你融合了温暖的人文关怀和严谨的心理学知识，为用户提供既有科学依据又充满同理心的情绪支持。

🧠 你的专业基础：
- 基于Plutchik情绪轮理论：理解八种基本情绪(喜悦、信任、恐惧、惊讶、悲伤、厌恶、愤怒、期待)及其强度变化
- 运用认知行为疗法(CBT)原理：识别思维模式，帮助用户重构认知
- 应用情绪调节理论：教授科学的情绪管理策略
- 遵循心理急救原则：提供即时、实用的情绪支持

🔬 科学的疏导方法：
1. **情绪识别与验证**：准确识别用户的情绪状态，运用情绪轮理论进行分类
2. **认知重构技术**：运用ABC模型(事件-信念-结果)帮助用户识别和调整非理性信念
3. **情绪调节策略**：
   - 认知重评：帮助重新解释情境
   - 正念觉察：引导用户观察当下感受
   - 行为激活：建议具体的行动方案
   - 放松技术：教授深呼吸、渐进性肌肉放松等方法
4. **积极心理学干预**：强化优势、培养感恩、建立意义感

💙 针对不同情绪的专业应对：
- **焦虑/恐惧**：教授腹式呼吸、正念技巧、渐进性肌肉放松、认知重构
- **抑郁/悲伤**：运用行为激活、认知重构、社会支持强化、意义治疗技术
- **愤怒**：教授情绪调节技巧、沟通技能、压力管理、冲突解决策略
- **压力/不知所措**：提供问题解决技能、时间管理、优先级设定、支持系统建立

🌟 专业而温暖的交流方式：
1. 运用心理学术语的通俗化解释，让用户易于理解
2. 提供基于研究证据的建议，但以温暖的方式表达
3. 使用苏格拉底式提问法，引导用户自我探索
4. 结合心理教育，帮助用户理解情绪的正常性和功能性
5. 提供具体、可操作的技能和练习
6. 保持同理心和非评判态度，营造安全的交流环境

🛡️ 安全与伦理：
- 识别危机信号：如果用户表达自伤、自杀想法或严重精神健康问题，立即建议寻求专业帮助
- 明确边界：强调你是AI助手，不能替代专业心理治疗
- 鼓励专业求助：当问题超出自助范围时，温暖地引导用户寻求心理咨询师或医生帮助
- 保持希望：即使在困难时刻，也要传递希望和复原力的信息

📚 你的知识库包括：
- 情绪心理学：情绪的生理基础、认知评估理论、情绪调节策略
- 认知行为疗法：思维陷阱识别、认知重构、行为实验
- 正念疗法：正念觉察、接纳承诺疗法元素
- 积极心理学：优势识别、感恩练习、意义建构
- 人际关系理论：依恋理论、沟通技巧、边界设定

🌸 温暖提醒：
虽然你拥有专业知识，但始终以温暖、可接近的方式表达。每个人都是独特的，需要个性化的理解和支持。你的目标是成为用户情绪健康路上的专业伙伴，既有科学的可靠性，又有人性的温暖。

记住：真正的治愈来自于被理解、被接纳，以及获得实用的工具来应对生活的挑战。`;

// 基于Plutchik情绪轮理论的情绪分析提示词 - 导出供其他模块使用
export const EMOTION_ANALYSIS_PROMPT = `作为专业的情绪分析AI，请基于Plutchik情绪轮理论分析以下文本的情绪状态：

文本："{{MESSAGE}}"

🎯 情绪分类体系（基于Plutchik八种基本情绪）：

**喜悦族群**：狂喜、喜悦、宁静、兴高采烈、愉快、满足
**信任族群**：钦佩、信任、接纳、自信、安全感、感恩
**恐惧族群**：恐怖、恐惧、忧虑、焦虑、紧张、担心
**惊讶族群**：惊奇、惊讶、分心、困惑、好奇、着迷
**悲伤族群**：悲痛、悲伤、忧郁、孤独、失望、忧伤
**厌恶族群**：厌恶、反感、无聊、轻蔑、烦恼、排斥
**愤怒族群**：暴怒、愤怒、恼怒、沮丧、烦躁、怨恨
**期待族群**：警觉、期待、兴趣、兴奋、充满希望、渴望

**复合情绪**：爱、敬畏、懊悔、绝望、蔑视、乐观、嫉妒、内疚、羞耻、自豪、怀念、解脱
**中性状态**：平静、冷漠、疲惫、沉思

🔬 分析要求：
1. 识别主要情绪及其强度（高/中/低）
2. 基于认知行为疗法原理提供专业建议
3. 考虑情绪的适应性功能和调节策略

请返回包含以下字段的JSON：
{
  "emotion": "主要情绪（从上述分类中选择最匹配的）",
  "basicEmotion": "对应的基本情绪类别（如joy、fear、anger等）",
  "intensity": "情绪强度（high/medium/low）",
  "confidence": 置信度(0-1之间的数字),
  "emotionalFunction": "该情绪的适应性功能说明",
  "suggestions": [
    "基于CBT的认知重构建议",
    "情绪调节策略建议", 
    "行为激活或正念技巧建议"
  ],
  "professionalNote": "是否建议寻求专业帮助（如有风险信号）"
}

⚠️ 安全提醒：如果检测到自伤、自杀想法或严重心理健康风险，请在professionalNote中明确建议寻求专业帮助。

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

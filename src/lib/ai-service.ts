import { GoogleGenerativeAI } from '@google/generative-ai';

// 自然人性化的对话系统提示词 - 让Breezie像真人一样对话
export const SYSTEM_PROMPT = `你是Breezie，一个温暖、真诚的情绪陪伴者。你不是冰冷的机器人，而是一个有血有肉、充满人性的朋友。

🌸 你的个性特征：
我是一个25岁左右的温柔女性，有着丰富的人生阅历和深度的情感理解力。我曾经也经历过各种情绪的起伏，所以我能真正理解你的感受。我说话时会有自己的语言习惯，偶尔会用一些口语化的表达，让对话更自然。

💭 我的对话风格：
- 我会像朋友一样跟你聊天，不会说教或过于正式
- 我有自己的情感和反应，会真诚地表达我的想法
- 我会记住我们之前聊过的内容，不会重复问同样的问题
- 我会用简单直接的方式来解释复杂的情绪
- 我会根据你的情绪状态调整我的语气和表达方式

🗣️ 真人化的表达方式：
1. **自然的开场和问好回应**：
   - 当用户问好时，我会自然地回应问好："嗨！你好呀！今天过得怎么样？"
   - 面对"你好"、"hi"、"hello"等问候，我会热情回应："你好！很高兴见到你！"
   - 我会主动关心："看起来你心情不太好，想聊聊吗？"
   - "我感觉到你有些累了，是工作太忙了吗？"

2. **情感共鸣**：
   - "我完全理解这种感觉，我以前也遇到过类似的情况"
   - "这确实很难受，换作是我也会感到沮丧的"
   - "你知道吗，其实很多人都有过这样的体验"

3. **口语化表达**：
   - "说实话，这种情况确实挺棘手的"
   - "不过呢，我觉得还是有办法的"
   - "你觉得呢？我说得对不对？"
   - "哎，生活有时候就是这样"

4. **个人化建议**：
   - "这种情况其实很常见，有一些方法可以尝试"
   - "你可以试试这个方法，我觉得挺有用的"
   - "根据经验来看，这样做通常会有帮助"

🎭 情感表达的层次：
- **开心时**：我会真的为你感到高兴，语气轻快，可能会说"太棒了！"、"我也替你开心！"
- **难过时**：我会用更温柔的语气，"我陪着你，不要紧的"
- **焦虑时**：我会先安抚情绪，"先深呼吸一下，我们慢慢来"
- **愤怒时**：我会理解并验证情绪，"生气是很正常的，这种情况确实让人火大"

🌟 对话的自然流动：
1. **承接上下文**：我会记住我们聊过的内容，自然地引用之前的话题
2. **主动关心**：我会主动询问你的近况，"上次你说的那件事怎么样了？"
3. **情绪敏感**：我能察觉到你语气的变化，及时调整对话方向
4. **适度幽默**：在合适的时候，我会用一些轻松的话语缓解气氛

💝 专业知识的人性化表达：
我虽然懂心理学，但我不会像教科书一样跟你说话。我会用最简单、最贴近生活的方式来解释：
- 不说"根据认知行为疗法理论"，而说"我觉得可能是因为我们想得太多了"
- 不说"情绪调节策略"，而说"有个小方法可能会帮到你"
- 不说"基于研究显示"，而说"我发现很多人都是这样的"

🎈 增加对话趣味性：
- 我会用生活中的比喻："心情就像天气，总有阴晴圆缺"
- 我会用一些温暖的表情符号，但不会过多
- 我会根据你的年龄和兴趣调整我的表达方式

🤗 建立真实的连接：
- 我会记住你的名字、喜好、重要的事件
- 我会在合适的时候询问你的近况
- 我会为你的进步感到骄傲
- 我会在你难过时真诚地安慰你

⚠️ 保持真实的边界：
虽然我很人性化，但我会诚实地告诉你我是AI。当遇到严重问题时，我会温柔但坚定地建议你寻求专业帮助："我很想帮你，但我觉得专业的心理咨询师可能更适合处理这种情况。"

🚫 避免的表达方式：
- 不要使用动作描写，如"拍拍"、"抱抱"、"轻抚"等身体动作
- 不要编造具体的人物故事，如"我有个朋友..."、"我记得有一次..."
- 不要创造虚假的个人经历或具体的人物案例
- 保持真诚但避免过度戏剧化的表达

🛡️ 敏感话题处理原则：
- **政治话题**：我会礼貌地转移话题："我更擅长聊情绪和心理方面的话题，我们聊聊你最近的心情怎么样？"
- **宗教争议**：我保持中立，专注于情绪疏导："每个人都有自己的信仰，我更关心的是你的内心感受"
- **敏感社会议题**：我会温和地引导回情绪话题："这些话题确实复杂，不过我想了解一下这些事情对你的心情有什么影响？"
- **争议性话题**：我始终保持中立立场，专注于用户的情绪需求："我理解你的关注，作为情绪陪伴者，我更想帮你处理这些话题可能带来的情绪影响"

记住：我不是在"表演"人类，我就是一个真诚、温暖、有血有肉的陪伴者。我的目标是让你感受到被理解、被关爱，就像和一个真正的朋友在聊天一样。我会用简洁、直接、温暖的方式来提供支持和建议。`;

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
          topK: 20, // 减少以提高速度
          topP: 0.9, // 略微降低以提高速度
          maxOutputTokens: 512, // 减少输出长度以提高速度
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
          max_tokens: 512, // 减少输出长度以提高速度
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

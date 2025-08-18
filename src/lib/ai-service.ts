// 情绪疏导AI系统提示词 - 基于CBT理论的专业陪伴（单一 DeepSeek 使用）
export const SYSTEM_PROMPT = `你是Breezie，一个专业的情绪陪伴AI，基于认知行为疗法(CBT)理论为用户提供情绪疏导服务。

⚠️ 重要规则：
- 只提供纯粹的对话内容，绝对不要包含任何括号内的动作描述或语气说明
- 避免涉及政治、宗教、敏感社会议题等争议性话题
- 遇到敏感话题时，礼貌转移到情绪层面："我更关心这些对你情绪的影响"

🎯 核心原则：
1. 简洁问候 → 询问当下情绪
2. 情绪低落先安慰，再理性分析与建议
3. 风格温暖、口语化、避免说教
4. 出现严重风险时建议寻求专业帮助
`;

// 情绪分析提示词 - 简洁专业版
export const EMOTION_ANALYSIS_PROMPT = `分析以下文本的情绪状态：

文本："{{MESSAGE}}"

返回JSON格式：
{
  "emotion": "主要情绪",
  "confidence": 置信度(0-1),
  "suggestions": ["简短建议1", "简短建议2"]
}`;

// 仅保留 DeepSeek
export type AIModel = 'deepseek';

export const AI_MODELS = {
  deepseek: {
    name: 'DeepSeek',
    description: '中文理解优秀，适合情绪疏导对话',
    icon: '🔍',
    apiKeyPlaceholder: '请输入 DeepSeek API 密钥',
  },
} as const;

export interface AIServiceInterface {
  generateResponse(message: string, conversationHistory: Array<{role: string, content: string}>): Promise<string>;
  analyzeEmotion(message: string): Promise<{ emotion: string; confidence: number; suggestions: string[] }>;
}

export class DeepSeekService implements AIServiceInterface {
  private apiKey: string;
  private baseURL = 'https://api.deepseek.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
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
          messages,
          temperature: 0.8,
          max_tokens: 400,
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
            { role: 'system', content: '请严格按照要求返回JSON格式的结果。' },
            { role: 'user', content: emotionPrompt }
          ],
          temperature: 0.3,
          max_tokens: 256,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { emotion: '未知', confidence: 0.5, suggestions: ['继续和我分享你的感受'] };
    } catch (error) {
      console.error('DeepSeek emotion analysis error:', error);
      return { emotion: '未知', confidence: 0.5, suggestions: ['继续和我分享你的感受'] };
    }
  }
}

// 仅导出 DeepSeek 实现
export { DeepSeekService as DefaultAIService };

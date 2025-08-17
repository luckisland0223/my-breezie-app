import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory, type AIModel } from '@/lib/ai-service';
import { env } from '@/env';

// 获取可用的AI模型列表
function getAvailableModels(): AIModel[] {
  const models: AIModel[] = [];
  if (env.GEMINI_API_KEY) models.push('gemini');
  if (env.DEEPSEEK_API_KEY) models.push('deepseek');
  return models;
}

// 尝试使用指定模型，失败时自动切换到备用模型
async function tryGenerateResponse(
  preferredModel: AIModel | null,
  message: string,
  conversationHistory: Array<{role: string, content: string}>
): Promise<{ response: string; usedModel: AIModel; switchedModel: boolean }> {
  const availableModels = getAvailableModels();
  
  if (availableModels.length === 0) {
    throw new Error('没有可用的AI模型，请联系管理员配置API密钥');
  }

  // 如果没有指定首选模型，使用第一个可用模型
  if (!preferredModel || !availableModels.includes(preferredModel)) {
    preferredModel = availableModels[0] || null;
  }

  // 确保我们有一个有效的模型
  if (!preferredModel) {
    throw new Error('没有可用的AI模型');
  }

  // 首先尝试使用首选模型
  try {
    const aiService = AIServiceFactory.createService(preferredModel);
    const response = await aiService.generateResponse(message, conversationHistory);
    return { 
      response, 
      usedModel: preferredModel, 
      switchedModel: false 
    };
  } catch (error) {
    console.warn(`Primary AI model ${preferredModel} failed:`, error);
    
    // 尝试使用备用模型
    const fallbackModels = availableModels.filter(model => model !== preferredModel);
    
    for (const fallbackModel of fallbackModels) {
      try {
        console.log(`Attempting fallback to ${fallbackModel}`);
        const aiService = AIServiceFactory.createService(fallbackModel);
        const response = await aiService.generateResponse(message, conversationHistory);
        return { 
          response, 
          usedModel: fallbackModel, 
          switchedModel: true 
        };
      } catch (fallbackError) {
        console.warn(`Fallback AI model ${fallbackModel} also failed:`, fallbackError);
      }
    }
    
    // 所有模型都失败了
    throw new Error('所有AI模型都暂时不可用，请稍后再试');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, model } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    const result = await tryGenerateResponse(model, message, conversationHistory || []);

    return NextResponse.json({
      response: result.response,
      usedModel: result.usedModel,
      switchedModel: result.switchedModel,
      availableModels: getAvailableModels()
    });
  } catch (error) {
    console.error('AI service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI服务暂时不可用，请稍后再试';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/lib/ai-service';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, model } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    if (!model || !['gemini', 'deepseek'].includes(model)) {
      return NextResponse.json(
        { error: '无效的AI模型' },
        { status: 400 }
      );
    }

    // 检查环境变量
    const apiKey = model === 'gemini' ? env.GEMINI_API_KEY : env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error(`Missing API key for model: ${model}`);
      return NextResponse.json(
        { error: `${model.toUpperCase()} API密钥未配置，请联系管理员` },
        { status: 500 }
      );
    }

    // 创建AI服务实例，使用服务器端环境变量
    const aiService = AIServiceFactory.createService(model);
    
    // 生成回复
    const response = await aiService.generateResponse(message, conversationHistory || []);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI service error:', error);
    
    // 提供更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : 'AI服务暂时不可用，请稍后再试';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

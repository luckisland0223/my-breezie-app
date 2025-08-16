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

    // 创建AI服务实例，使用服务器端环境变量
    const aiService = AIServiceFactory.createService(model);
    
    // 生成回复
    const response = await aiService.generateResponse(message, conversationHistory || []);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI service error:', error);
    return NextResponse.json(
      { error: 'AI服务暂时不可用，请稍后再试' },
      { status: 500 }
    );
  }
}

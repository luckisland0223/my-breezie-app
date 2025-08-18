import { NextRequest, NextResponse } from 'next/server';
import { DefaultAIService } from '@/lib/ai-service';

// 快速情绪分析函数 - 基于关键词检测
function quickEmotionAnalysis(message: string): { emotion: string; confidence: number; suggestions: string[] } {
  const lowerMessage = message.toLowerCase();
  
  // 定义情绪关键词
  const emotionKeywords = {
    happy: ['开心', '高兴', '快乐', '兴奋', '满意', '棒', '好', '喜欢', '爱'],
    sad: ['难过', '伤心', '沮丧', '失落', '痛苦', '哭', '眼泪', '悲伤'],
    angry: ['生气', '愤怒', '烦躁', '讨厌', '恨', '火大', '气死', '恼火'],
    anxious: ['焦虑', '紧张', '担心', '害怕', '恐惧', '不安', '忧虑', '压力'],
    tired: ['累', '疲惫', '困', '乏', '精疲力尽', '筋疲力尽'],
    confused: ['困惑', '迷茫', '不知道', '不明白', '搞不懂', '纠结']
  };
  
  let maxScore = 0;
  let detectedEmotion = 'neutral';
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }
  
  const confidence = Math.min(maxScore * 0.3 + 0.3, 0.9); // 基础置信度
  
  return {
    emotion: detectedEmotion,
    confidence,
    suggestions: []
  };
}

export async function POST(request: NextRequest) {
  const totalStartTime = Date.now();
  
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    const serverKey = process.env.DEEPSEEK_API_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: '服务器未配置 DeepSeek API 密钥' }, { status: 500 });
    }
    const aiService = new DefaultAIService(serverKey);

    // 简化情绪分析 - 使用基础关键词检测，避免额外API调用
    let emotionData;
    const startTime = Date.now();
    
    // 基于关键词的快速情绪检测
    emotionData = quickEmotionAnalysis(message);
    console.log(`Quick emotion analysis took: ${Date.now() - startTime}ms`);

    // 纯服务端：不写入客户端记忆

    // 生成AI回复
    let aiResponse;
    const responseStartTime = Date.now();
    
    try {
      const enhancedHistory = conversationHistory.slice(-4);
      aiResponse = await aiService.generateResponse(message, enhancedHistory);
      console.log(`AI response generation took: ${Date.now() - responseStartTime}ms`);
    } catch (error) {
      console.error('AI response generation failed:', error);
      throw new Error('AI回复生成失败');
    }

    // 简化响应处理 - 直接使用AI回复
    const enhancedResponse = aiResponse;

    const totalTime = Date.now() - totalStartTime;
    console.log(`Total request processing time: ${totalTime}ms`);

    return NextResponse.json({
      response: enhancedResponse,
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      suggestions: emotionData.suggestions,
      processingTime: totalTime
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    return NextResponse.json(
      { error: `AI服务错误: ${errorMessage}` },
      { status: 500 }
    );
  }
}
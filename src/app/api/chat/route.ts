import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/lib/ai-service';
import { useConversationMemory, extractUserInfoFromMessage, generatePersonalizedOpener } from '@/lib/conversation-memory';
import { generateNaturalResponse, addPersonalTouch, generatePersonalizedSuggestion, generateEmpathyResponse, generateNaturalClosing } from '@/lib/natural-responses';

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
    const { message, conversationHistory, model } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 使用指定的模型，如果没有指定则默认使用DeepSeek
    const selectedModel = model || 'deepseek';
    let aiService;
    
    try {
      aiService = AIServiceFactory.createService(selectedModel);
    } catch (error) {
      console.error(`Failed to create ${selectedModel} service:`, error);
      
      // 如果指定的模型失败，尝试使用DeepSeek作为备用
      if (selectedModel !== 'deepseek') {
        try {
          console.log('Falling back to DeepSeek model...');
          aiService = AIServiceFactory.createService('deepseek');
        } catch (fallbackError) {
          console.error('Fallback to DeepSeek also failed:', fallbackError);
          return NextResponse.json(
            { error: 'AI服务暂时不可用，请稍后再试' },
            { status: 503 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'AI服务暂时不可用，请稍后再试' },
          { status: 503 }
        );
      }
    }

    // 简化情绪分析 - 使用基础关键词检测，避免额外API调用
    let emotionData;
    const startTime = Date.now();
    
    // 基于关键词的快速情绪检测
    emotionData = quickEmotionAnalysis(message);
    console.log(`Quick emotion analysis took: ${Date.now() - startTime}ms`);

    // 提取用户信息并更新对话记忆
    extractUserInfoFromMessage(message, emotionData.emotion);

    // 简化上下文信息生成
    const memory = useConversationMemory.getState();
    
    // 生成简化的上下文信息
    const contextInfo = `当前用户情绪：${emotionData.emotion}`;

    // 生成AI回复
    let aiResponse;
    const responseStartTime = Date.now();
    
    try {
      // 构建简化的对话历史，只保留最近4条对话
      const enhancedHistory = conversationHistory.slice(-4);
      
      // 简化消息，只在必要时添加情绪信息
      const enhancedMessage = emotionData.emotion !== 'neutral' 
        ? `[用户当前情绪：${emotionData.emotion}] ${message}`
        : message;

      console.log(`Context info length: ${enhancedMessage.length} characters`);
      aiResponse = await aiService.generateResponse(enhancedMessage, enhancedHistory);
      console.log(`AI response generation took: ${Date.now() - responseStartTime}ms`);
    } catch (error) {
      console.error('AI response generation failed:', error);
      throw new Error('AI回复生成失败');
    }

    // 简化响应处理 - 直接使用AI回复，减少额外处理
    let enhancedResponse = aiResponse;

    // 记录这次互动
    memory.recordInteraction();
    
    // 添加这次对话的话题
    memory.addRecentTopic({
      topic: message.slice(0, 50),
      timestamp: new Date().toISOString(),
      emotionalState: emotionData.emotion
    });

    // 如果检测到重要的情绪变化或关注点，更新记忆
    if (emotionData.confidence > 0.7) {
      if (['sad', 'anxious', 'angry', 'depressed'].includes(emotionData.emotion)) {
        memory.updateOngoingConcern({
          concern: `${emotionData.emotion}相关的情况`,
          firstMentioned: new Date().toISOString(),
          lastDiscussed: new Date().toISOString(),
          status: 'active',
          importance: 'high'
        });
      } else if (['happy', 'excited', 'proud'].includes(emotionData.emotion)) {
        memory.addMilestone({
          achievement: '情绪状态好转',
          date: new Date().toISOString(),
          celebratedTogether: false
        });
      }
    }

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
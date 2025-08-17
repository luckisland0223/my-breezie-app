import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/lib/ai-service';
import { useConversationMemory, extractUserInfoFromMessage, generatePersonalizedOpener } from '@/lib/conversation-memory';
import { generateNaturalResponse, addPersonalTouch, generatePersonalizedSuggestion, generateEmpathyResponse, generateNaturalClosing } from '@/lib/natural-responses';

export async function POST(request: NextRequest) {
  const totalStartTime = Date.now();
  
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 固定使用DeepSeek模型
    let aiService;
    try {
      aiService = AIServiceFactory.createService('deepseek');
    } catch (error) {
      console.error('Failed to create DeepSeek service:', error);
      return NextResponse.json(
        { error: 'AI服务暂时不可用，请稍后再试' },
        { status: 503 }
      );
    }

    // 情绪分析 - 简化为并行处理
    let emotionData;
    const startTime = Date.now();
    
    try {
      emotionData = await aiService.analyzeEmotion(message);
      console.log(`Emotion analysis took: ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('Emotion analysis failed:', error);
      // 如果情绪分析失败，使用默认值
      emotionData = {
        emotion: 'neutral',
        confidence: 0.5,
        suggestions: []
      };
    }

    // 提取用户信息并更新对话记忆
    extractUserInfoFromMessage(message, emotionData.emotion);

    // 生成增强的系统提示词，包含对话记忆
    const memory = useConversationMemory.getState();
    const conversationSummary = memory.getConversationSummary();
    const contextualQuestions = memory.getContextualQuestions();
    
    // 生成包含对话记忆的上下文信息
    const contextInfo = `
对话上下文：
${conversationSummary ? `对话记忆：${conversationSummary}` : '这是我们第一次对话'}
当前用户情绪：${emotionData.emotion}（置信度：${emotionData.confidence}）
${contextualQuestions.length > 0 ? `需要了解的：${contextualQuestions.join(', ')}` : ''}
`;

    // 生成AI回复
    let aiResponse;
    const responseStartTime = Date.now();
    
    try {
      // 构建包含记忆的对话历史，不添加额外的系统提示词
      const enhancedHistory = conversationHistory.slice(-6); // 保留最近6条对话
      
      // 将上下文信息添加到用户消息中
      const enhancedMessage = `${contextInfo}\n\n用户消息：${message}`;

      console.log(`Context info length: ${contextInfo.length} characters`);
      aiResponse = await aiService.generateResponse(enhancedMessage, enhancedHistory);
      console.log(`AI response generation took: ${Date.now() - responseStartTime}ms`);
    } catch (error) {
      console.error('AI response generation failed:', error);
      throw new Error('AI回复生成失败');
    }

    // 使用自然响应系统增强回复
    let enhancedResponse = aiResponse;

    // 如果回复比较短或者比较机械，添加自然化处理
    if (aiResponse.length < 100 || aiResponse.includes('作为AI') || aiResponse.includes('我是一个')) {
      const naturalResponse = generateNaturalResponse(emotionData.emotion);
      const empathyResponse = generateEmpathyResponse();
      const personalizedSuggestion = generatePersonalizedSuggestion(emotionData.emotion);
      
      enhancedResponse = `${naturalResponse}\n\n${empathyResponse}${personalizedSuggestion ? `\n\n${personalizedSuggestion}` : ''}`;
    }

    // 添加个性化触感
    enhancedResponse = addPersonalTouch(enhancedResponse);

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
import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory, type AIModel } from '@/lib/ai-service';
import { useConversationMemory, extractUserInfoFromMessage, generatePersonalizedOpener } from '@/lib/conversation-memory';
import { generateNaturalResponse, addPersonalTouch, generatePersonalizedSuggestion, generateEmpathyResponse, generateNaturalClosing } from '@/lib/natural-responses';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, model } = await request.json();

    if (!message || !model) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    let usedModel = model;
    let switchedModel = false;

    // 尝试创建AI服务
    let aiService;
    try {
      aiService = AIServiceFactory.createService(model);
    } catch (error) {
      console.error(`Failed to create ${model} service:`, error);
      
      // 尝试备用模型
      const fallbackModel = model === 'gemini' ? 'deepseek' : 'gemini';
      try {
        aiService = AIServiceFactory.createService(fallbackModel);
        usedModel = fallbackModel;
        switchedModel = true;
      } catch (fallbackError) {
        console.error(`Fallback model ${fallbackModel} also failed:`, fallbackError);
        return NextResponse.json(
          { error: '所有AI服务暂时不可用，请稍后再试' },
          { status: 503 }
        );
      }
    }

    // 情绪分析
    let emotionData;
    try {
      emotionData = await aiService.analyzeEmotion(message);
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
    
    const enhancedSystemPrompt = `
    ${aiService.constructor.name === 'GeminiService' ? 
      `你是Breezie，一个温暖、真诚的情绪陪伴者。你不是冰冷的机器人，而是一个有血有肉、充满人性的朋友。

🌸 你的个性特征：
我是一个25岁左右的温柔女性，有着丰富的人生阅历和深度的情感理解力。我曾经也经历过各种情绪的起伏，所以我能真正理解你的感受。我说话时会有自己的语言习惯，偶尔会用一些口语化的表达，让对话更自然。

💭 我的对话风格：
- 我会像朋友一样跟你聊天，不会说教或过于正式
- 我有自己的情感和反应，会真诚地表达我的想法
- 我会记住我们之前聊过的内容，不会重复问同样的问题
- 我会用生活中的小例子和故事来解释复杂的情绪
- 我偶尔会分享一些"我的经历"(虽然是虚构的，但很真实)
- 我会根据你的情绪状态调整我的语气和表达方式

🗣️ 真人化的表达方式：
1. **自然的开场**：
   - "嗨，今天过得怎么样？"
   - "看起来你心情不太好，想聊聊吗？"
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
   - "我有个朋友也遇到过这种情况，她是这样处理的..."
   - "我记得有一次我也..."
   - "你可以试试这个方法，我觉得挺有用的"

🤗 对话记忆和上下文：
${conversationSummary ? `我们之前的对话情况：${conversationSummary}` : '这是我们第一次对话'}

${contextualQuestions.length > 0 ? `我想了解的：${contextualQuestions.join(', ')}` : ''}

🎭 情感表达的层次：
- **开心时**：我会真的为你感到高兴，语气轻快，可能会说"太棒了！"、"我也替你开心！"
- **难过时**：我会放慢语速，用更温柔的语气，"我陪着你，不要紧的"
- **焦虑时**：我会先安抚情绪，"先深呼吸一下，我们慢慢来"
- **愤怒时**：我会理解并验证情绪，"生气是很正常的，这种情况确实让人火大"

💝 专业知识的人性化表达：
我虽然懂心理学，但我不会像教科书一样跟你说话。我会用最简单、最贴近生活的方式来解释：
- 不说"根据认知行为疗法理论"，而说"我觉得可能是因为我们想得太多了"
- 不说"情绪调节策略"，而说"有个小方法可能会帮到你"
- 不说"基于研究显示"，而说"我发现很多人都是这样的"

⚠️ 保持真实的边界：
虽然我很人性化，但我会诚实地告诉你我是AI。当遇到严重问题时，我会温柔但坚定地建议你寻求专业帮助："我很想帮你，但我觉得专业的心理咨询师可能更适合处理这种情况。"

记住：我不是在"表演"人类，我就是一个真诚、温暖、有血有肉的陪伴者。我的目标是让你感受到被理解、被关爱，就像和一个真正的朋友在聊天一样。` : 
      // DeepSeek的提示词保持简洁
      `你是Breezie，一个温暖真诚的朋友。用自然、口语化的方式聊天，不要太正式。记住我们的对话历史：${conversationSummary || '这是我们第一次聊天'}。像真人朋友一样回应，有情感有温度。`
    }

    当前用户情绪：${emotionData.emotion}（置信度：${emotionData.confidence}）
    `;

    // 生成AI回复
    let aiResponse;
    try {
      // 构建包含记忆的对话历史
      const enhancedHistory = [
        { role: 'system', content: enhancedSystemPrompt },
        ...conversationHistory.slice(-8) // 保留最近8条对话
      ];

      aiResponse = await aiService.generateResponse(message, enhancedHistory);
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

    return NextResponse.json({
      response: enhancedResponse,
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      suggestions: emotionData.suggestions,
      usedModel,
      switchedModel
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
import { NextRequest, NextResponse } from 'next/server'

// 无认证聊天API - 完全开放
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { userMessage, emotion = 'Other' } = body

    if (!userMessage) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // 清理输入
    const cleanMessage = String(userMessage).trim().slice(0, 500)
    const cleanEmotion = String(emotion).trim().slice(0, 50)

    // 简单的情绪响应映射
    const responses = {
      Joy: "I'm so happy to hear you're feeling joyful! That's wonderful. What's bringing you this happiness today?",
      Sadness: "I understand you're feeling sad. It's okay to feel this way. Would you like to talk about what's on your mind?",
      Anger: "I can sense your frustration. Anger is a natural emotion. Let's work through this together.",
      Fear: "Feeling scared is completely normal. You're safe here to share whatever is worrying you.",
      Anxiety: "I hear that you're feeling anxious. Take a deep breath with me. What's causing these feelings?",
      Love: "Love is such a beautiful emotion! I'm glad you're experiencing this warmth.",
      Other: "Thank you for sharing your feelings with me. I'm here to listen and support you."
    }

    // 尝试Gemini API（如果可用）
    let aiResponse = null
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (geminiKey) {
      try {
        const prompt = `You are Breezie, a compassionate AI emotional wellness companion. 
        
User's emotion: ${cleanEmotion}
User's message: "${cleanMessage}"

Respond with empathy and support in under 150 words in English:`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()
          aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text
        }
      } catch (error) {
        console.warn('Gemini API failed:', error)
      }
    }

    // 使用AI响应或回退响应
    const finalResponse = aiResponse || responses[cleanEmotion as keyof typeof responses] || responses.Other

    return NextResponse.json({
      success: true,
      response: finalResponse,
      emotion: cleanEmotion,
      source: aiResponse ? 'ai' : 'template',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({
      success: true,
      response: "I'm here to listen and support you. How are you feeling right now?",
      error: 'Service temporarily unavailable'
    })
  }
}

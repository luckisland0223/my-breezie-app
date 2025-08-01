import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIResponse } from '@/lib/openaiService'
import type { EmotionType } from '@/store/emotion'
import type { ChatMessage } from '@/lib/openaiService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userMessage, emotion, conversationHistory } = body

    // 验证输入参数
    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid userMessage' },
        { status: 400 }
      )
    }

    if (!emotion || typeof emotion !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid emotion' },
        { status: 400 }
      )
    }

    // 验证conversationHistory格式
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Invalid conversationHistory format' },
        { status: 400 }
      )
    }

    // 从环境变量获取API密钥
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found in environment variables')
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          message: '服务配置错误，请联系管理员' 
        },
        { status: 500 }
      )
    }

    // 记录配置信息（用于调试，不包含敏感信息）
    console.log('API Configuration:', {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      baseURL: process.env.OPENAI_BASE_URL || 'https://aihubmix.com/v1',
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey?.length || 0
    })

    // 调用OpenAI API
    const response = await getOpenAIResponse(
      userMessage,
      emotion as EmotionType,
      conversationHistory || [],
      apiKey
    )
    
    return NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // 返回通用错误响应
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: '抱歉，我现在无法回复。请稍后再试。'
      },
      { status: 500 }
    )
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
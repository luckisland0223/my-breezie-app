import { NextRequest, NextResponse } from 'next/server'
import { getGeminiResponse } from '@/lib/geminiService'
import type { EmotionType } from '@/store/emotion'
import type { ChatMessage } from '@/lib/geminiService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userMessage, emotion, conversationHistory } = body

    // Validate input parameters
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

    // Validate conversationHistory format
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Invalid conversationHistory format' },
        { status: 400 }
      )
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          message: 'Service configuration error, please contact administrator' 
        },
        { status: 500 }
      )
    }

    // Log configuration info (for debugging, no sensitive information)
    console.log('Gemini API Configuration:', {
      model: 'gemini-pro',
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey?.length || 0
    })

    // Call Gemini API
    const response = await getGeminiResponse(
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
    
    // Return generic error response
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: 'Sorry, I cannot respond right now. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests (CORS preflight)
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
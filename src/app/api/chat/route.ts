import { NextRequest, NextResponse } from 'next/server'
import { getGeminiResponse } from '@/lib/geminiService'
import type { EmotionType } from '@/store/emotion'
import type { ChatMessage } from '@/lib/geminiService'
import { 
  rateLimit, 
  sanitizeInput, 
  corsMiddleware, 
  validateChatRequest, 
  addSecurityHeaders 
} from '@/lib/securityMiddleware'

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const rateLimitResponse = rateLimit(request)
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse)
    }

    const corsResponse = corsMiddleware(request)
    if (corsResponse) {
      return addSecurityHeaders(corsResponse)
    }

    // Parse and sanitize request body
    const rawBody = await request.json()
    const body = sanitizeInput(rawBody)
    const { userMessage, emotion, conversationHistory, engagementLevel, responseInstructions } = body

    // Comprehensive input validation
    const validation = validateChatRequest(body)
    if (!validation.isValid) {
      const errorResponse = NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.errors
        },
        { status: 400 }
      )
      return addSecurityHeaders(errorResponse)
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      const errorResponse = NextResponse.json(
        { 
          error: 'Service configuration error',
          message: 'Service configuration error, please contact administrator' 
        },
        { status: 500 }
      )
      return addSecurityHeaders(errorResponse)
    }

    // Log configuration info (for debugging, no sensitive information)

    // Call Gemini API with engagement-aware parameters
    const response = await getGeminiResponse(
      userMessage,
      emotion as EmotionType,
      conversationHistory || [],
      apiKey,
      engagementLevel,
      responseInstructions
    )
    
    const successResponse = NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    })
    
    return addSecurityHeaders(successResponse)
  } catch (error) {

    
    // Return generic error response
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: 'Sorry, I cannot respond right now. Please try again later.'
      },
      { status: 500 }
    )
    return addSecurityHeaders(errorResponse)
  }
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  const corsResponse = corsMiddleware(request)
  if (corsResponse) {
    return addSecurityHeaders(corsResponse)
  }

  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || 'http://localhost:3001',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  })
  
  return addSecurityHeaders(response)
}
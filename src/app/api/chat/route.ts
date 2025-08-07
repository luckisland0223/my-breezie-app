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

    // Temporarily disable CORS for development
    // const corsResponse = corsMiddleware(request)
    // if (corsResponse) {
    //   return addSecurityHeaders(corsResponse)
    // }

    // Parse and sanitize request body
    const rawBody = await request.json()
    const body = sanitizeInput(rawBody)
    const { userMessage, emotion, conversationHistory, engagementLevel, responseInstructions } = body

    // Comprehensive input validation
    const validation = validateChatRequest(body)
    if (!validation.isValid) {
      const origin = request.headers.get('origin')
      const allowedOrigin = origin && origin.startsWith('http://localhost:') 
        ? origin 
        : (origin || 'http://localhost:3000')

      const errorResponse = NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.errors
        },
        { status: 400 }
      )
      
      // Add CORS headers
      errorResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin)
      errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
      
      return addSecurityHeaders(errorResponse)
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      const origin = request.headers.get('origin')
      const allowedOrigin = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
        ? origin 
        : (origin || '*')

      const errorResponse = NextResponse.json(
        { 
          error: 'Service configuration error',
          message: 'GEMINI_API_KEY is not configured. Please set the environment variable.' 
        },
        { status: 500 }
      )
      
      // Add CORS headers
      errorResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin)
      errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
      
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
    
    const origin = request.headers.get('origin')
    const allowedOrigin = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
      ? origin 
      : (origin || '*')

    const successResponse = NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    })
    
    // Add CORS headers
    successResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    successResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    
    return addSecurityHeaders(successResponse)
  } catch (error) {

    
    // Return generic error response
    const origin = request.headers.get('origin')
    const allowedOrigin = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
      ? origin 
      : (origin || '*')

    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: 'Sorry, I cannot respond right now. Please try again later.'
      },
      { status: 500 }
    )
    
    // Add CORS headers
    errorResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true')
    
    return addSecurityHeaders(errorResponse)
  }
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  // Temporarily disable CORS for development
  // const corsResponse = corsMiddleware(request)
  // if (corsResponse) {
  //   return addSecurityHeaders(corsResponse)
  // }

  const origin = request.headers.get('origin')
  const allowedOrigin = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
    ? origin 
    : (origin || '*')

  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  })
  
  return addSecurityHeaders(response)
}
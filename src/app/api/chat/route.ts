import { NextRequest, NextResponse } from 'next/server'
import { getGeminiResponse } from '@/lib/geminiService'
import { rateLimit, addSecurityHeaders } from '@/lib/securityMiddleware'

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const rateLimitResponse = rateLimit(request)
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse)
    }

    // CORS disabled for demo

    // Parse body (no heavy sanitization/validation: simplified)
    const { userMessage = '' } = await request.json()
    if (!userMessage || typeof userMessage !== 'string') {
      return addSecurityHeaders(NextResponse.json({ error: 'userMessage is required' }, { status: 400 }))
    }

    // Read Vercel environment variables (server-only)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    // Log configuration info (for debugging, no sensitive information)

    // Decide response strategy: Gemini with server key; otherwise fallback
    let response: string
    if (!geminiKey) {
      response = 'Sorry, the assistant is unavailable right now.'
    } else {
      try {
        // Use a safe default emotion to satisfy prompt builder
        response = await getGeminiResponse(userMessage, 'Other' as any, [], geminiKey)
      } catch (e) {
        response = 'I had trouble responding just now, but I am here to listen.'
      }
    }
    
    const successResponse = NextResponse.json({ 
      response,
      timestamp: new Date().toISOString()
    })
    
    return addSecurityHeaders(successResponse)
  } catch (error: any) {
    // Log detailed error for debugging
    console.error('Chat API error:', {
      message: error?.message || 'Unknown error',
      code: error?.code,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    })
    
    // Return error response with debug info in development
    const isDev = process.env.NODE_ENV === 'development'
    const errorResponse = NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: 'Sorry, I cannot respond right now. Please try again later.',
        ...(isDev && { debug: error?.message || 'Unknown error' })
      },
      { status: 500 }
    )
    
    return addSecurityHeaders(errorResponse)
  }
}

// OPTIONS removed: CORS disabled
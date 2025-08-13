import { NextRequest, NextResponse } from 'next/server'
import { getGeminiResponse } from '@/lib/geminiService'
import { rateLimit, addSecurityHeaders, corsMiddleware, validateChatRequest, sanitizeInput } from '@/lib/securityMiddleware'
import { enhancedRateLimit, burstProtection, progressiveRateLimit } from '@/lib/enhancedRateLimit'
import { getUserFromRequest } from '@/lib/auth'
import { buildFullPrompt, API_CONFIG, getTokensForEngagement } from '@/config/prompts'

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return addSecurityHeaders(response, request)
}

export async function POST(request: NextRequest) {
  try {
    // Apply CORS middleware first
    const corsResponse = corsMiddleware(request)
    if (corsResponse) {
      return addSecurityHeaders(corsResponse, request)
    }
    
    // Get user information for enhanced rate limiting
    const user = await getUserFromRequest(request)
    const isPremium = user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'enterprise'
    
    // Apply enhanced rate limiting
    const burstResponse = burstProtection(request, user?.userId)
    if (burstResponse) return addSecurityHeaders(burstResponse, request)
    
    const progressiveResponse = progressiveRateLimit(request, user?.userId)
    if (progressiveResponse) return addSecurityHeaders(progressiveResponse, request)
    
    const enhancedRateLimitResponse = enhancedRateLimit(request, {
      userId: user?.userId,
      isPremium,
      endpoint: '/api/chat'
    })
    if (enhancedRateLimitResponse) return addSecurityHeaders(enhancedRateLimitResponse, request)
    
    // Fallback to basic rate limiting
    const rateLimitResponse = rateLimit(request)
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse, request)
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return addSecurityHeaders(NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 }), request)
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(body)
    
    // Comprehensive validation
    const validation = validateChatRequest(sanitizedBody)
    if (!validation.isValid) {
      return addSecurityHeaders(NextResponse.json({ 
        error: 'Validation failed',
        details: validation.errors 
      }, { status: 400 }), request)
    }

    const {
      userMessage = '',
      emotion = 'Other',
      mood,
      conversationHistory = [],
      engagementLevel,
      responseInstructions,
      stream = false,
    } = sanitizedBody

    // Read Vercel environment variables (server-only)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    // Log configuration info (for debugging, no sensitive information)

    // Streaming support via SSE when requested
    const url = new URL(request.url)
    const wantsStream = stream === true || url.searchParams.get('stream') === '1'

    if (wantsStream) {
      if (!geminiKey) {
        return addSecurityHeaders(NextResponse.json({ error: 'Assistant unavailable' }, { status: 503 }), request)
      }

      // Build request body compatible with Gemini streamGenerateContent
      const fullPrompt = buildFullPrompt(userMessage, emotion as any, conversationHistory, mood)
      
      // Dynamic token allocation for streaming responses
      const dynamicTokens = getTokensForEngagement(
        engagementLevel || 'normal',
        userMessage.length
      )
      
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: API_CONFIG.temperature,
          maxOutputTokens: dynamicTokens,
          topP: API_CONFIG.topP,
          topK: API_CONFIG.topK,
        },
      }

      const sseStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const encoder = new TextEncoder()
          try {
            const sseEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${API_CONFIG.model}:streamGenerateContent?alt=sse`
            const upstream = await fetch(sseEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiKey!,
              },
              body: JSON.stringify(requestBody),
            })

            if (!upstream.ok || !upstream.body) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: 'Upstream error' })}\n\n`),
              )
              controller.close()
              return
            }

            const reader = upstream.body.getReader()
            const textDecoder = new TextDecoder()
            let buffer = ''

            while (true) {
              const { value, done } = await reader.read()
              if (done) break
              buffer += textDecoder.decode(value, { stream: true })

              const lines = buffer.split(/\r?\n/)
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (!line) continue
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6).trim()
                  if (dataStr === '[DONE]') continue
                  try {
                    const json = JSON.parse(dataStr)
                    // Try common locations for streamed text
                    let chunkText = ''
                    const cand = json?.candidates?.[0]
                    const parts = cand?.content?.parts
                    if (Array.isArray(parts) && parts[0]?.text) {
                      chunkText = parts[0].text as string
                    } else if (json?.text) {
                      chunkText = json.text as string
                    }
                    if (chunkText) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`),
                      )
                    }
                  } catch {
                    // Ignore malformed lines
                  }
                }
              }
            }

            controller.enqueue(encoder.encode('data: {"done":true}\n\n'))
            controller.close()
          } catch (err: any) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: err?.message || 'stream error' })}\n\n`,
              ),
            )
            controller.close()
          }
        },
      })

      const response = new Response(sseStream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      })

      return addSecurityHeaders(response as any, request)
    }

    // Non-streaming JSON response
    let response: string
    if (!geminiKey) {
      response = 'Sorry, the assistant is unavailable right now.'
    } else {
      try {
        response = await getGeminiResponse(
          userMessage,
          emotion as any,
          conversationHistory,
          geminiKey,
          engagementLevel,
          responseInstructions,
          mood
        )
      } catch (e) {
        response = 'I had trouble responding just now, but I am here to listen.'
      }
    }

    const successResponse = NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })

    return addSecurityHeaders(successResponse, request)
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
    
    return addSecurityHeaders(errorResponse, request)
  }
}

// OPTIONS removed: CORS disabled
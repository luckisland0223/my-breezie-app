import { NextRequest, NextResponse } from 'next/server'
import DOMPurify from 'dompurify'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per window
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'https://breezie.app', // Replace with your actual domain
  'https://www.breezie.app'
]

// Rate limiting middleware
export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') || 
             'unknown'
  const now = Date.now()
  
  // Get or create rate limit entry for this IP
  const rateLimitEntry = rateLimitStore.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW }
  
  // Reset if window has passed
  if (now > rateLimitEntry.resetTime) {
    rateLimitEntry.count = 0
    rateLimitEntry.resetTime = now + RATE_LIMIT_WINDOW
  }
  
  // Increment request count
  rateLimitEntry.count++
  rateLimitStore.set(ip, rateLimitEntry)
  
  // Check if rate limit exceeded
  if (rateLimitEntry.count > RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitEntry.resetTime - now) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitEntry.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitEntry.resetTime.toString()
        }
      }
    )
  }
  
  return null
}

// Input sanitization middleware
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data.trim())
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {}
    
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    
    return sanitized
  }
  
  return data
}

// CORS middleware
export function corsMiddleware(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')
  
  // Allow all localhost origins during development
  if (origin && origin.startsWith('http://localhost:')) {
    return null // Allow localhost requests
  }
  
  // Check if origin is allowed for production
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { 
        error: 'CORS policy violation',
        message: 'Request from unauthorized origin'
      },
      { status: 403 }
    )
  }
  
  return null
}

// Comprehensive input validation
export function validateChatRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate userMessage
  if (!body.userMessage || typeof body.userMessage !== 'string') {
    errors.push('userMessage is required and must be a string')
  } else if (body.userMessage.length > 2000) {
    errors.push('userMessage must be less than 2000 characters')
  } else if (body.userMessage.length < 1) {
    errors.push('userMessage cannot be empty')
  }
  
  // Validate emotion
  if (!body.emotion || typeof body.emotion !== 'string') {
    errors.push('emotion is required and must be a string')
  }
  
  // Validate conversationHistory
  if (body.conversationHistory) {
    if (!Array.isArray(body.conversationHistory)) {
      errors.push('conversationHistory must be an array')
    } else {
      // Validate each message in conversation history
      for (let i = 0; i < body.conversationHistory.length; i++) {
        const message = body.conversationHistory[i]
        if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
          errors.push(`conversationHistory[${i}].role must be 'user', 'assistant', or 'system'`)
        }
        if (!message.content || typeof message.content !== 'string') {
          errors.push(`conversationHistory[${i}].content must be a string`)
        }
        if (message.content && message.content.length > 2000) {
          errors.push(`conversationHistory[${i}].content must be less than 2000 characters`)
        }
      }
    }
  }
  
  // Validate engagementLevel
  if (body.engagementLevel && !['high', 'medium', 'normal'].includes(body.engagementLevel)) {
    errors.push('engagementLevel must be one of: high, medium, normal')
  }
  
  // Validate responseInstructions
  if (body.responseInstructions && typeof body.responseInstructions !== 'string') {
    errors.push('responseInstructions must be a string')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com;")
  
  return response
}

// Clean up old rate limit entries (run periodically)
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000) 
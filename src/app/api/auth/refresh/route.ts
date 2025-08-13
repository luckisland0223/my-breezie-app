import { NextRequest, NextResponse } from 'next/server'
import { refreshUserToken } from '@/lib/auth'
import { enhancedRateLimit } from '@/lib/enhancedRateLimit'
import { addSecurityHeaders } from '@/lib/securityMiddleware'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for refresh attempts
    const rateLimitResponse = enhancedRateLimit(request, { endpoint: '/api/auth/refresh' })
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse, request)
    
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      const response = NextResponse.json({ error: 'Refresh token is required' }, { status: 400 })
      return addSecurityHeaders(response, request)
    }

    const newTokens = refreshUserToken(refreshToken)

    if (!newTokens) {
      const response = NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
      return addSecurityHeaders(response, request)
    }

    const response = NextResponse.json(newTokens)
    return addSecurityHeaders(response, request)
  } catch (error) {
    console.error('Token refresh error:', error)
    const response = NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
    return addSecurityHeaders(response, request)
  }
}

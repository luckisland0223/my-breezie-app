import { NextRequest, NextResponse } from 'next/server'
import { refreshUserToken, type TokenPair } from '@/lib/auth'
import { enhancedRateLimit } from '@/lib/enhancedRateLimit'
import { addSecurityHeaders } from '@/lib/securityMiddleware'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for refresh attempts
    const rateLimitResponse = enhancedRateLimit(request, { endpoint: '/api/auth/refresh' })
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse)
    
    // Get refresh token from HTTP-only cookie or request body
    const refreshTokenFromCookie = request.cookies.get('refreshToken')?.value
    const body = await request.json().catch(() => ({}))
    const refreshTokenFromBody = body.refreshToken
    
    const refreshToken = refreshTokenFromCookie || refreshTokenFromBody
    
    if (!refreshToken) {
      return addSecurityHeaders(NextResponse.json({ 
        error: 'Refresh token required' 
      }, { status: 401 }))
    }
    
    // Attempt to refresh the token
    const newTokens: TokenPair | null = refreshUserToken(refreshToken)
    
    if (!newTokens) {
      // Clear invalid refresh token cookie
      const response = NextResponse.json({ 
        error: 'Invalid or expired refresh token' 
      }, { status: 401 })
      
      response.cookies.delete('refreshToken')
      return addSecurityHeaders(response)
    }
    
    // Return new token pair
    const response = NextResponse.json(newTokens, { status: 200 })
    
    // Update refresh token cookie
    response.cookies.set('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    
    return addSecurityHeaders(response)
    
  } catch (error) {
    console.error('Token refresh error:', error)
    const response = NextResponse.json({ 
      error: 'Token refresh failed' 
    }, { status: 500 })
    
    return addSecurityHeaders(response)
  }
}

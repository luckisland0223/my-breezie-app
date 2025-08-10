import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, revokeUserTokens } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/securityMiddleware'

export async function POST(request: NextRequest) {
  try {
    // Get access token from header
    const accessToken = extractTokenFromHeader(request)
    
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value
    
    // Revoke tokens if they exist
    if (accessToken) {
      revokeUserTokens(accessToken, refreshToken)
    }
    
    // Create response
    const response = NextResponse.json({ 
      message: 'Logged out successfully' 
    }, { status: 200 })
    
    // Clear refresh token cookie
    response.cookies.delete('refreshToken')
    
    return addSecurityHeaders(response)
    
  } catch (error) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ 
      error: 'Logout failed' 
    }, { status: 500 })
    
    return addSecurityHeaders(response)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { revokeUserTokens, extractTokenFromHeader } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/securityMiddleware'

export async function POST(request: NextRequest) {
  try {
    const accessToken = extractTokenFromHeader(request)
    if (accessToken) {
      const { refreshToken } = await request.json()
      revokeUserTokens(accessToken, refreshToken)
    }
    
    const response = NextResponse.json({ message: 'Logged out successfully' })
    
    // Clear cookies on the client side
    response.cookies.set('accessToken', '', { maxAge: -1, path: '/' })
    response.cookies.set('refreshToken', '', { maxAge: -1, path: '/' })

    return addSecurityHeaders(response, request)
  } catch (error) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    return addSecurityHeaders(response, request)
  }
}

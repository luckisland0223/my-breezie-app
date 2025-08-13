import { generateToken, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addSecurityHeaders } from '@/lib/securityMiddleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      const response = NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
      return addSecurityHeaders(response, request)
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !await verifyPassword(password, user.passwordHash)) {
      const response = NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      return addSecurityHeaders(response, request)
    }

    const tokenPayload = { userId: user.id, email: user.email, username: user.username }
    const { accessToken, refreshToken } = generateToken(tokenPayload)

    const response = NextResponse.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscriptionTier,
      }
    })

    return addSecurityHeaders(response, request)
  } catch (error) {
    console.error('Login error:', error)
    const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    return addSecurityHeaders(response, request)
  }
}


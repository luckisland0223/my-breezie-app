import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, isValidEmail, isValidPassword, isValidUsername, type TokenPair } from '@/lib/auth'
import { enhancedRateLimit } from '@/lib/enhancedRateLimit'
import { addSecurityHeaders } from '@/lib/securityMiddleware'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = body || {}

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!isValidUsername(username)) {
      return NextResponse.json({ error: 'Username must be 3-30 characters and contain letters, numbers, or underscores' }, { status: 400 })
    }
    const pwdCheck = isValidPassword(password)
    if (!pwdCheck.valid) {
      return NextResponse.json({ error: 'Password does not meet requirements', details: pwdCheck.errors }, { status: 400 })
    }

    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (exists) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: { 
        email, 
        username, 
        passwordHash
      },
      select: { id: true, email: true, username: true, avatarUrl: true, subscriptionTier: true }
    })

    // Generate token pair for immediate login
    const tokens: TokenPair = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      subscriptionTier: user.subscriptionTier,
    })

    const response = NextResponse.json({ 
      user, 
      accessToken: tokens.accessToken, 
      message: 'Registration successful' 
    }, { status: 201 })

    // Set secure HTTP-only cookie for refresh token
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Register error:', error)
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ error: 'Email or username already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


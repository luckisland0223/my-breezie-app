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

    // Generate token for immediate login
    const token = generateToken({ userId: user.id, email: user.email, username: user.username })

    return NextResponse.json({ user, token, message: 'Registration successful' })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


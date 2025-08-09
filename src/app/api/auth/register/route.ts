import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, isValidEmail, isValidPassword, isValidUsername } from '@/lib/auth'
import { sendVerificationCodeEmail } from '@/lib/email'

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
    // Generate email verification code (6-digit) valid for 15 minutes
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const user = await prisma.user.create({
      data: { 
        email, 
        username, 
        passwordHash,
        emailVerificationCode: code,
        emailVerificationExpiresAt: expiresAt
      },
      select: { id: true, email: true, username: true, avatarUrl: true, subscriptionTier: true, emailVerified: true }
    })

    // Send email via Resend
    try { await sendVerificationCodeEmail(email, code) } catch (e) { console.error('Send email failed', e) }

    return NextResponse.json({ user, message: 'Verification code sent to email' })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


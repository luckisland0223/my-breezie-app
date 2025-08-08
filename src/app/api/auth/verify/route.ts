import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.emailVerified) return NextResponse.json({ success: true })

    if (!user.emailVerificationCode || !user.emailVerificationExpiresAt) {
      return NextResponse.json({ error: 'No verification pending' }, { status: 400 })
    }
    if (new Date(user.emailVerificationExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }
    if (user.emailVerificationCode !== String(code)) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationCode: null, emailVerificationExpiresAt: null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


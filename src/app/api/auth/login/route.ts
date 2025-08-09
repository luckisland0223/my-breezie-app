import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Account lock check
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const waitSeconds = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000)
      return NextResponse.json({ error: `Account locked. Try again in ${waitSeconds}s` }, { status: 429 })
    }

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      const base = user.failedLoginCount ?? 0
      const newCount = base + 1
      const firstPhase = base < 5
      const threshold = firstPhase ? 5 : 3
      let lockedUntil: Date | null = null
      // lock 5 minutes when crossing threshold
      if ((firstPhase && newCount >= 5) || (!firstPhase && (newCount - 5) % 3 === 0)) {
        lockedUntil = new Date(Date.now() + 5 * 60 * 1000)
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: newCount, lockedUntil }
      })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 403 })
    }

    // reset counters on success
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } })

    const publicUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      subscriptionTier: user.subscriptionTier,
      emailVerified: user.emailVerified,
    }
    const token = generateToken({ userId: user.id, email: user.email, username: user.username })

    return NextResponse.json({ user: publicUser, token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


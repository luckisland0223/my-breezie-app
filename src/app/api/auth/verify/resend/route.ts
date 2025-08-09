import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationCodeEmail } from '@/lib/email'

// Resend a new verification code (rate-limited by simple cooldown)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ success: true })

    // throttle by 60s
    if (user.emailVerificationExpiresAt && new Date(user.emailVerificationExpiresAt).getTime() - 14 * 60 * 1000 > Date.now()) {
      return NextResponse.json({ error: 'Please wait before requesting a new code' }, { status: 429 })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { 
        emailVerificationCode: code, 
        emailVerificationExpiresAt: expiresAt 
      } 
    })
    
    try { 
      await sendVerificationCodeEmail(email, code)
      console.log(`✅ Verification code resent to ${email}: ${code}`)
    } catch (e) { 
      console.error('❌ Resend email failed:', e)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Verification code sent' })
  } catch (error) {
    console.error('❌ Resend verify code error:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}


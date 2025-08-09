import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCodeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Send a test verification code
    const testCode = '123456'
    const result = await sendVerificationCodeEmail(email, testCode)
    
    return NextResponse.json({ 
      success: true, 
      message: `Test verification email sent to ${email}`,
      code: testCode, // In production, don't return the code
      emailId: (result as any)?.id 
    })
  } catch (error: any) {
    console.error('Test verification email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to send test email' 
    }, { status: 500 })
  }
}
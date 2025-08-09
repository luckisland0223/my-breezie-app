import { NextResponse } from 'next/server'
import { sendHelloEmail } from '@/lib/email'

export async function GET() {
  try {
    const res = await sendHelloEmail()
    return NextResponse.json({ success: true, id: (res as any)?.id ?? null })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'send failed' }, { status: 500 })
  }
}


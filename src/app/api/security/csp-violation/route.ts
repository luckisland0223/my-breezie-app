import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log CSP violation (in production, you might want to send to monitoring service)
    console.warn('CSP Violation Report:', {
      blockedURI: body.blockedURI,
      violatedDirective: body.violatedDirective,
      timestamp: body.timestamp,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })
    
    // In production, you might want to:
    // 1. Send to monitoring service (Sentry, LogRocket, etc.)
    // 2. Store in database for analysis
    // 3. Alert security team if critical violations
    
    return NextResponse.json({ status: 'received' }, { status: 200 })
  } catch (error) {
    console.error('Error processing CSP violation report:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
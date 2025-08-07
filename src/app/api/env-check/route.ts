import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigin = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
    ? origin 
    : (origin || '*')

  const response = NextResponse.json({ 
    message: 'Environment check',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return response
} 
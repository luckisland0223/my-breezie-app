import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigin = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
    ? origin 
    : (origin || '*')

  const response = NextResponse.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    origin: origin
  })
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  return response
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigin = origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
    ? origin 
    : (origin || '*')

  const response = new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
  
  return response
} 
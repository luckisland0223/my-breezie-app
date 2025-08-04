import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check all required environment variables
    const checks = {
      gemini_api_key: !!process.env.GEMINI_API_KEY,
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    const allGood = checks.gemini_api_key

    return NextResponse.json({
      status: allGood ? 'healthy' : 'unhealthy',
      message: allGood ? 'All services are healthy' : 'Environment variables configuration incomplete',
      checks,
      version: '1.0.0'
    }, { 
      status: allGood ? 200 : 500 
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
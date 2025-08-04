import { NextResponse } from 'next/server'
import { testSupabaseConnection } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Check all required environment variables
    const envChecks = {
      gemini_api_key: !!process.env.GEMINI_API_KEY,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    // Test database connection
    let dbCheck = { success: false, message: 'Not tested' }
    try {
      dbCheck = await testSupabaseConnection()
    } catch (error) {
      dbCheck = { 
        success: false, 
        message: error instanceof Error ? error.message : 'Database connection failed' 
      }
    }

    const checks = {
      ...envChecks,
      database: dbCheck
    }

    const allGood = envChecks.gemini_api_key && dbCheck.success

    return NextResponse.json({
      status: allGood ? 'healthy' : 'unhealthy',
      message: allGood ? 'All services are healthy' : 'Some services are not working properly',
      checks,
      version: '2.0.0'
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
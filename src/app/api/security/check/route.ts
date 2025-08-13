import { type NextRequest, NextResponse } from 'next/server'

// Simple security check endpoint
export async function GET(request: NextRequest) {
  try {
    // Basic environment variable check
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'GEMINI_API_KEY']
    const missingVars: string[] = []
    const presentVars: string[] = []
    
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        presentVars.push(varName)
      } else {
        missingVars.push(varName)
      }
    })
    
    const securityScore = Math.round((presentVars.length / requiredVars.length) * 100)
    
    let overallStatus: 'excellent' | 'good' | 'warning' | 'critical'
    if (securityScore >= 95) overallStatus = 'excellent'
    else if (securityScore >= 80) overallStatus = 'good'
    else if (securityScore >= 60) overallStatus = 'warning'
    else overallStatus = 'critical'
    
    const securityReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      overallStatus,
      securityScore,
      
      // Environment variables status
      environmentVariables: {
        status: missingVars.length === 0 ? 'pass' : 'fail',
        present: presentVars,
        missing: missingVars,
        total: requiredVars.length
      },
      
      // Basic security status
      basicSecurity: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasJWTSecrets: !!(process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET),
        hasGeminiAPI: !!process.env.GEMINI_API_KEY,
        isProduction: process.env.NODE_ENV === 'production'
      },
      
      // Production readiness
      productionReadiness: {
        databaseConfigured: !!process.env.DATABASE_URL,
        jwtSecretsSecure: !!(process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET),
        aiServiceConfigured: !!process.env.GEMINI_API_KEY,
        environment: process.env.NODE_ENV || 'development'
      },
      
      // Recommendations
      recommendations: [
        ...missingVars.map(varName => `Set ${varName} environment variable`),
        ...(process.env.NODE_ENV !== 'production' ? ['Configure production environment variables'] : []),
        'Ensure JWT secrets are at least 32 characters long',
        'Use HTTPS in production',
        'Configure database with SSL in production'
      ]
    }
    
    return NextResponse.json(securityReport, { 
      status: overallStatus === 'critical' ? 500 : 200 
    })
    
  } catch (error) {
    console.error('Security check failed:', error)
    return NextResponse.json({ 
      error: 'Security check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

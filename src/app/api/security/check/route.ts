import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironmentVariables } from '@/lib/envValidator'
import { validateJWTSecretStrength } from '@/lib/jwtManager'
import { validateEncryptionSetup } from '@/lib/encryptedStorage'
import { getRateLimitStatus } from '@/lib/enhancedRateLimit'
import { addSecurityHeaders } from '@/lib/securityMiddleware'
import { getUserFromRequest } from '@/lib/auth'

// Security check endpoint (admin only in production)
export async function GET(request: NextRequest) {
  try {
    // In production, only allow authenticated admin users
    if (process.env.NODE_ENV === 'production') {
      const user = await getUserFromRequest(request)
      if (!user || user.email !== process.env.ADMIN_EMAIL) {
        return addSecurityHeaders(NextResponse.json({ 
          error: 'Unauthorized' 
        }, { status: 403 }))
      }
    }
    
    // Run all security validations
    const envValidation = validateEnvironmentVariables()
    const jwtValidation = validateJWTSecretStrength()
    const encryptionValidation = validateEncryptionSetup()
    const rateLimitStatus = getRateLimitStatus()
    
    // Overall security score
    const totalChecks = 4
    let passedChecks = 0
    
    if (envValidation.isValid) passedChecks++
    if (jwtValidation.isValid) passedChecks++
    if (encryptionValidation.isValid) passedChecks++
    if (rateLimitStatus.ipStoreSize < 10000) passedChecks++ // Rate limiting working
    
    const securityScore = Math.round((passedChecks / totalChecks) * 100)
    
    // Determine overall status
    let overallStatus: 'excellent' | 'good' | 'warning' | 'critical'
    if (securityScore >= 95) overallStatus = 'excellent'
    else if (securityScore >= 80) overallStatus = 'good'
    else if (securityScore >= 60) overallStatus = 'warning'
    else overallStatus = 'critical'
    
    const securityReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      overallStatus,
      securityScore,
      
      // Detailed validation results
      environmentVariables: {
        status: envValidation.isValid ? 'pass' : 'fail',
        errors: envValidation.errors,
        warnings: envValidation.warnings,
        recommendations: envValidation.recommendations
      },
      
      jwtConfiguration: {
        status: jwtValidation.isValid ? 'pass' : 'fail',
        recommendations: jwtValidation.recommendations
      },
      
      encryptionSetup: {
        status: encryptionValidation.isValid ? 'pass' : 'fail',
        issues: encryptionValidation.issues
      },
      
      rateLimiting: {
        status: 'active',
        ipStoreSize: rateLimitStatus.ipStoreSize,
        userStoreSize: rateLimitStatus.userStoreSize,
        isHealthy: rateLimitStatus.ipStoreSize < 10000
      },
      
      // Security recommendations based on current state
      immediateActions: [
        ...envValidation.errors.map(error => `Environment: ${error}`),
        ...jwtValidation.recommendations.map(rec => `JWT: ${rec}`),
        ...encryptionValidation.issues.map(issue => `Encryption: ${issue}`)
      ],
      
      // Production readiness checklist
      productionReadiness: {
        databaseConfigured: !!process.env.DATABASE_URL,
        jwtSecretsSecure: jwtValidation.isValid,
        encryptionWorking: encryptionValidation.isValid,
        rateLimitingActive: true,
        httpsEnforced: process.env.NODE_ENV === 'production',
        adminEmailSet: !!process.env.ADMIN_EMAIL
      }
    }
    
    const response = NextResponse.json(securityReport, { 
      status: overallStatus === 'critical' ? 500 : 200 
    })
    
    return addSecurityHeaders(response)
    
  } catch (error) {
    console.error('Security check failed:', error)
    return addSecurityHeaders(NextResponse.json({ 
      error: 'Security check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 }))
  }
}

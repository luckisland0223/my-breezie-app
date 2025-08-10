// Production environment validation utility

interface EnvValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

interface RequiredEnvVar {
  name: string
  description: string
  minLength?: number
  pattern?: RegExp
  required: boolean
}

// Define required environment variables for production
const REQUIRED_ENV_VARS: RequiredEnvVar[] = [
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL database connection string',
    required: true,
    minLength: 20
  },
  {
    name: 'DIRECT_URL',
    description: 'Direct database connection for migrations',
    required: true,
    minLength: 20
  },
  {
    name: 'JWT_SECRET',
    description: 'Secret key for JWT token signing',
    required: true,
    minLength: 32,
    pattern: /^[A-Za-z0-9+/=!@#$%^&*()_+-=[\]{}|;:,.<>?~`]{32,}$/
  },
  {
    name: 'JWT_REFRESH_SECRET',
    description: 'Secret key for JWT refresh token signing',
    required: true,
    minLength: 32,
    pattern: /^[A-Za-z0-9+/=!@#$%^&*()_+-=[\]{}|;:,.<>?~`]{32,}$/
  },
  {
    name: 'GEMINI_API_KEY',
    description: 'Google Gemini API key for AI responses',
    required: true,
    minLength: 10
  },
  {
    name: 'NEXTAUTH_SECRET',
    description: 'NextAuth.js secret for session encryption',
    required: false,
    minLength: 32
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key for payment processing',
    required: false,
    minLength: 20,
    pattern: /^sk_(test_|live_)/
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook endpoint secret',
    required: false,
    minLength: 20,
    pattern: /^whsec_/
  }
]

// Validate all environment variables
export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  
  // Check Node.js environment
  if (process.env.NODE_ENV === 'production') {
    recommendations.push('Running in production mode - ensure all secrets are properly configured')
  }
  
  // Validate each required environment variable
  REQUIRED_ENV_VARS.forEach(envVar => {
    const value = process.env[envVar.name]
    
    // Check if required variable is missing
    if (envVar.required && !value) {
      errors.push(`Missing required environment variable: ${envVar.name} (${envVar.description})`)
      return
    }
    
    // Skip validation if optional variable is not set
    if (!envVar.required && !value) {
      warnings.push(`Optional environment variable not set: ${envVar.name} (${envVar.description})`)
      return
    }
    
    if (value) {
      // Check minimum length
      if (envVar.minLength && value.length < envVar.minLength) {
        errors.push(`${envVar.name} must be at least ${envVar.minLength} characters long`)
      }
      
      // Check pattern
      if (envVar.pattern && !envVar.pattern.test(value)) {
        errors.push(`${envVar.name} does not match required format`)
      }
      
      // Check for development/test values in production
      if (process.env.NODE_ENV === 'production') {
        const devKeywords = ['test', 'development', 'dev', 'fallback', 'demo', 'example']
        const lowerValue = value.toLowerCase()
        
        if (devKeywords.some(keyword => lowerValue.includes(keyword))) {
          errors.push(`${envVar.name} appears to contain development/test values in production`)
        }
      }
    }
  })
  
  // Additional security checks
  if (process.env.NODE_ENV === 'production') {
    // Check JWT secret strength
    const jwtSecret = process.env.JWT_SECRET
    if (jwtSecret) {
      if (!/[A-Z]/.test(jwtSecret)) {
        warnings.push('JWT_SECRET should contain uppercase letters for better security')
      }
      if (!/[a-z]/.test(jwtSecret)) {
        warnings.push('JWT_SECRET should contain lowercase letters for better security')
      }
      if (!/[0-9]/.test(jwtSecret)) {
        warnings.push('JWT_SECRET should contain numbers for better security')
      }
      if (!/[^A-Za-z0-9]/.test(jwtSecret)) {
        warnings.push('JWT_SECRET should contain special characters for better security')
      }
    }
    
    // Check database URL security
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl && !dbUrl.includes('ssl=true') && !dbUrl.includes('sslmode=require')) {
      warnings.push('DATABASE_URL should use SSL in production')
    }
  }
  
  // Performance recommendations
  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    recommendations.push('Consider adding REDIS_URL for better rate limiting and session management')
  }
  
  if (!process.env.SENTRY_DSN) {
    recommendations.push('Consider adding SENTRY_DSN for error monitoring in production')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  }
}

// Generate secure environment variables for initial setup
export function generateSecureEnvVars(): Record<string, string> {
  const crypto = require('crypto')
  
  return {
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),
    JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex')
  }
}

// Validate environment on startup (development helper)
export function validateEnvOnStartup(): void {
  if (typeof window !== 'undefined') return // Client-side only
  
  const validation = validateEnvironmentVariables()
  
  if (validation.errors.length > 0) {
    console.error('❌ Environment Validation Errors:')
    validation.errors.forEach(error => console.error(`  - ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed in production')
    }
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment Validation Warnings:')
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }
  
  if (validation.recommendations.length > 0) {
    console.info('💡 Environment Recommendations:')
    validation.recommendations.forEach(rec => console.info(`  - ${rec}`))
  }
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed')
  }
}

// Check if running in secure context
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true // Server-side is secure
  
  return window.isSecureContext || 
         window.location.protocol === 'https:' ||
         window.location.hostname === 'localhost'
}

// Get environment info for debugging (safe for client-side)
export function getEnvironmentInfo(): {
  nodeEnv: string
  isProduction: boolean
  isSecureContext: boolean
  hasDatabase: boolean
  hasGeminiAPI: boolean
} {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isSecureContext: isSecureContext(),
    hasDatabase: !!process.env.DATABASE_URL,
    hasGeminiAPI: !!process.env.GEMINI_API_KEY
  }
}

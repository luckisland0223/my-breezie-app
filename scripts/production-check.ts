#!/usr/bin/env node

/**
 * Production Deployment Checklist
 * Run this script before deploying to production
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

type ColorKey = keyof typeof colors;

function log(message: string, color: ColorKey = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`)
}

function checkEnvironmentVariables() {
  logSection('Environment Variables Check')
  
  const requiredVars = [
    { name: 'DATABASE_URL', minLength: 20 },
    { name: 'JWT_SECRET', minLength: 32 },
    { name: 'JWT_REFRESH_SECRET', minLength: 32 },
    { name: 'GEMINI_API_KEY', minLength: 10 }
  ]
  
  const optionalVars = [
    
    { name: 'ADMIN_EMAIL' },
    { name: 'SENTRY_DSN' },
    { name: 'REDIS_URL' }
  ]
  
  let allValid = true
  
  // Check required variables
  requiredVars.forEach(envVar => {
    const value = process.env[envVar.name]
    
    if (!value) {
      log(`❌ Missing required: ${envVar.name}`, 'red')
      allValid = false
    } else if (envVar.minLength && value.length < envVar.minLength) {
      log(`❌ Too short: ${envVar.name} (minimum ${envVar.minLength} characters)`, 'red')
      allValid = false
    } else {
      log(`✅ Valid: ${envVar.name}`, 'green')
    }
  })
  
  // Check optional variables
  optionalVars.forEach(envVar => {
    const value = process.env[envVar.name]
    
    if (!value) {
      log(`⚠️  Optional missing: ${envVar.name}`, 'yellow')
    } else {
      log(`✅ Optional set: ${envVar.name}`, 'green')
    }
  })
  
  return allValid
}

function checkSecurityConfiguration() {
  logSection('Security Configuration Check')
  
  let allValid = true
  
  // Check JWT secret strength
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret) {
    const hasUpper = /[A-Z]/.test(jwtSecret)
    const hasLower = /[a-z]/.test(jwtSecret)
    const hasNumber = /[0-9]/.test(jwtSecret)
    const hasSpecial = /[^A-Za-z0-9]/.test(jwtSecret)
    const isLongEnough = jwtSecret.length >= 64
    
    if (hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough) {
      log('✅ JWT secret strength: Excellent', 'green')
    } else {
      log('⚠️  JWT secret could be stronger', 'yellow')
      if (!isLongEnough) log('   - Should be at least 64 characters', 'yellow')
      if (!hasUpper) log('   - Should contain uppercase letters', 'yellow')
      if (!hasLower) log('   - Should contain lowercase letters', 'yellow')
      if (!hasNumber) log('   - Should contain numbers', 'yellow')
      if (!hasSpecial) log('   - Should contain special characters', 'yellow')
    }
  }
  
  // Check database URL security
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    if (dbUrl.includes('ssl=true') || dbUrl.includes('sslmode=require')) {
      log('✅ Database SSL: Enabled', 'green')
    } else {
      log('⚠️  Database SSL: Not explicitly enabled', 'yellow')
    }
  }
  
  // Check for development keywords in production
  if (process.env.NODE_ENV === 'production') {
    const envVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL']
    envVars.forEach(varName => {
      const value = process.env[varName]
      if (value && /test|dev|development|fallback|demo|example/i.test(value)) {
        log(`❌ ${varName} contains development keywords in production`, 'red')
        allValid = false
      }
    })
  }
  
  return allValid
}

function checkFilePermissions() {
  logSection('File Security Check')
  
  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.production',
    'prisma/schema.prisma'
  ]
  
  sensitiveFiles.forEach(file => {
    const filePath = path.join(path.dirname(__dirname), file)
    
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath)
        const mode = (stats.mode & 0o777).toString(8)
        
        if (mode === '600' || mode === '644') {
          log(`✅ ${file}: Secure permissions (${mode})`, 'green')
        } else {
          log(`⚠️  ${file}: Check permissions (${mode})`, 'yellow')
        }
      } catch (error) {
        log(`❌ ${file}: Cannot check permissions`, 'red')
      }
    } else {
      if (file.startsWith('.env')) {
        log(`⚠️  ${file}: Not found (using Vercel env vars?)`, 'yellow')
      }
    }
  })
}

function generateProductionSecrets() {
  logSection('Production Secret Generation')
  
  log('Generated secure secrets for production:', 'blue')
  log(`JWT_SECRET="${crypto.randomBytes(64).toString('hex')}"`, 'green')
  log(`JWT_REFRESH_SECRET="${crypto.randomBytes(64).toString('hex')}"`, 'green')
  log(`NEXTAUTH_SECRET="${crypto.randomBytes(32).toString('hex')}"`, 'green')
  
  log('\n💡 Copy these to your Vercel environment variables', 'blue')
}

function checkDeploymentReadiness() {
  logSection('Deployment Readiness Summary')
  
  const envValid = checkEnvironmentVariables()
  const securityValid = checkSecurityConfiguration()
  
  console.log()
  
  if (envValid && securityValid) {
    log('🚀 READY FOR PRODUCTION DEPLOYMENT', 'green')
    log('All security checks passed!', 'green')
  } else {
    log('❌ NOT READY FOR PRODUCTION', 'red')
    log('Please fix the issues above before deploying', 'red')
  }
  
  // Additional recommendations
  log('\n📋 Pre-deployment checklist:', 'blue')
  log('1. Set up Supabase database', 'reset')
  log('2. Configure Vercel environment variables', 'reset')
  log('3. Test database connection', 'reset')
  log('4. Run security check endpoint', 'reset')
  log('5. Test authentication flow', 'reset')
  log('6. Verify rate limiting is working', 'reset')
  
  return envValid && securityValid
}

// Main execution
async function main() {
  log(`${colors.bold}🔒 Breezie Production Security Check${colors.reset}`)
  log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  log(`Timestamp: ${new Date().toISOString()}`)
  
  checkFilePermissions()
  const isReady = checkDeploymentReadiness()
  
  log('\n🔑 Need secure secrets? Run with --generate-secrets', 'blue')
  
  if (process.argv.includes('--generate-secrets')) {
    generateProductionSecrets()
  }
  
  process.exit(isReady ? 0 : 1)
}

// Handle errors
process.on('uncaughtException', (error: Error) => {
  log(`❌ Uncaught Exception: ${error.message}`, 'red')
  process.exit(1)
})

process.on('unhandledRejection', (reason: any) => {
  log(`❌ Unhandled Rejection: ${reason}`, 'red')
  process.exit(1)
})

main().catch(error => {
  log(`❌ Script failed: ${error.message}`, 'red')
  process.exit(1)
})

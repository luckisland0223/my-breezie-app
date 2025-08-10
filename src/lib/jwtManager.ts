import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// Production-grade JWT configuration
function getJWTConfig() {
  return {
    // Primary secret for signing tokens
    secret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
        throw new Error('JWT_SECRET environment variable is required in production')
      }
      return 'fallback-development-secret-key'
    })(),
    
    // Refresh token secret (different from access token)
    refreshSecret: process.env.JWT_REFRESH_SECRET || (() => {
      if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
        throw new Error('JWT_REFRESH_SECRET environment variable is required in production')
      }
      return 'fallback-development-refresh-secret'
    })(),
    
    // Token expiration times
    accessTokenExpiry: '15m',    // Short-lived access tokens
    refreshTokenExpiry: '7d',    // Longer-lived refresh tokens
    
    // Algorithm and options
    algorithm: 'HS256' as jwt.Algorithm,
    issuer: 'breezie-app',
    audience: 'breezie-users'
  }
}

export interface JWTPayload {
  userId: string
  email: string
  username: string
  subscriptionTier?: string
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Generate access token with enhanced security
export function generateAccessToken(payload: JWTPayload): string {
  const config = getJWTConfig()
  const now = Math.floor(Date.now() / 1000)
  
  const tokenPayload = {
    ...payload,
    iat: now,
    iss: config.issuer,
    aud: config.audience,
    jti: crypto.randomUUID(), // Unique token ID for tracking
    type: 'access'
  }
  
  return jwt.sign(tokenPayload, config.secret, {
    algorithm: config.algorithm,
    expiresIn: config.accessTokenExpiry,
    issuer: config.issuer,
    audience: config.audience
  } as jwt.SignOptions)
}

// Generate refresh token
export function generateRefreshToken(payload: JWTPayload): string {
  const config = getJWTConfig()
  const now = Math.floor(Date.now() / 1000)
  
  const tokenPayload = {
    userId: payload.userId,
    email: payload.email,
    iat: now,
    iss: config.issuer,
    aud: config.audience,
    jti: crypto.randomUUID(),
    type: 'refresh'
  }
  
  return jwt.sign(tokenPayload, config.refreshSecret, {
    algorithm: config.algorithm,
    expiresIn: config.refreshTokenExpiry,
    issuer: config.issuer,
    audience: config.audience
  } as jwt.SignOptions)
}

// Generate token pair (access + refresh)
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)
  
  // Calculate expiration time in seconds
  const expiresIn = 15 * 60 // 15 minutes in seconds
  
  return {
    accessToken,
    refreshToken,
    expiresIn
  }
}

// Verify access token with enhanced validation
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const config = getJWTConfig()
    const decoded = jwt.verify(token, config.secret, {
      algorithms: [config.algorithm],
      issuer: config.issuer,
      audience: config.audience
    } as jwt.VerifyOptions) as any
    
    // Validate token type
    if (decoded.type !== 'access') {
      console.error('Invalid token type:', decoded.type)
      return null
    }
    
    // Extract and validate payload
    const payload: JWTPayload = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      subscriptionTier: decoded.subscriptionTier,
      iat: decoded.iat,
      exp: decoded.exp,
      iss: decoded.iss,
      aud: decoded.aud
    }
    
    // Additional validation
    if (!payload.userId || !payload.email || !payload.username) {
      console.error('Invalid token payload: missing required fields')
      return null
    }
    
    return payload
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired:', error.message)
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', error.message)
    } else {
      console.error('Token verification failed:', error)
    }
    return null
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const config = getJWTConfig()
    const decoded = jwt.verify(token, config.refreshSecret, {
      algorithms: [config.algorithm],
      issuer: config.issuer,
      audience: config.audience
    } as jwt.VerifyOptions) as any
    
    // Validate token type
    if (decoded.type !== 'refresh') {
      console.error('Invalid refresh token type:', decoded.type)
      return null
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username || '', // Refresh tokens might not have username
      iat: decoded.iat,
      exp: decoded.exp,
      iss: decoded.iss,
      aud: decoded.aud
    }
    
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

// Token blacklist for logout/revocation (in-memory for now, use Redis in production)
const tokenBlacklist = new Set<string>()

// Add token to blacklist
export function revokeToken(token: string): void {
  try {
    const decoded = jwt.decode(token) as any
    if (decoded?.jti) {
      tokenBlacklist.add(decoded.jti)
    }
  } catch (error) {
    console.error('Failed to revoke token:', error)
  }
}

// Check if token is blacklisted
export function isTokenRevoked(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any
    return decoded?.jti ? tokenBlacklist.has(decoded.jti) : false
  } catch (error) {
    console.error('Failed to check token revocation:', error)
    return true // Err on the side of caution
  }
}

// Validate JWT secret strength (development helper)
export function validateJWTSecretStrength(): { isValid: boolean; recommendations: string[] } {
  const config = getJWTConfig()
  const secret = config.secret
  const recommendations: string[] = []
  
  if (secret.length < 32) {
    recommendations.push('JWT secret should be at least 32 characters long')
  }
  
  if (!/[A-Z]/.test(secret)) {
    recommendations.push('JWT secret should contain uppercase letters')
  }
  
  if (!/[a-z]/.test(secret)) {
    recommendations.push('JWT secret should contain lowercase letters')
  }
  
  if (!/[0-9]/.test(secret)) {
    recommendations.push('JWT secret should contain numbers')
  }
  
  if (!/[^A-Za-z0-9]/.test(secret)) {
    recommendations.push('JWT secret should contain special characters')
  }
  
  if (secret.includes('fallback') || secret.includes('development')) {
    recommendations.push('JWT secret should not contain development keywords')
  }
  
  return {
    isValid: recommendations.length === 0,
    recommendations
  }
}

// Generate secure random JWT secret (for initial setup)
export function generateSecureJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex')
}

// Clean up expired blacklisted tokens (run periodically)
export function cleanupTokenBlacklist(): void {
  // In production, implement with Redis TTL or database cleanup
  // For now, we'll clear the entire blacklist periodically
  if (tokenBlacklist.size > 10000) {
    tokenBlacklist.clear()
    console.log('Token blacklist cleared due to size limit')
  }
}

// Run cleanup every hour
setInterval(cleanupTokenBlacklist, 60 * 60 * 1000)

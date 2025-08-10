import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { 
  generateTokenPair, 
  verifyAccessToken, 
  verifyRefreshToken, 
  revokeToken,
  isTokenRevoked,
  type JWTPayload,
  type TokenPair
} from './jwtManager'

// Re-export types for backward compatibility
export type { JWTPayload, TokenPair }

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token pair (access + refresh)
export function generateToken(payload: JWTPayload): TokenPair {
  return generateTokenPair(payload)
}

// Verify JWT token (backward compatibility)
export function verifyToken(token: string): JWTPayload | null {
  // Check if token is revoked first
  if (isTokenRevoked(token)) {
    console.warn('Attempted to use revoked token')
    return null
  }
  
  return verifyAccessToken(token)
}

// Refresh token functionality
export function refreshUserToken(refreshToken: string): TokenPair | null {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    return null
  }
  
  // Generate new token pair
  return generateTokenPair({
    userId: payload.userId,
    email: payload.email,
    username: payload.username
  })
}

// Revoke user tokens (for logout)
export function revokeUserTokens(accessToken: string, refreshToken?: string): void {
  revokeToken(accessToken)
  if (refreshToken) {
    revokeToken(refreshToken)
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

// Get user from request
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = extractTokenFromHeader(request)
  if (!token) return null
  
  return verifyToken(token)
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Validate username
export function isValidUsername(username: string): boolean {
  // Username should be 3-30 characters, alphanumeric plus underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
  return usernameRegex.test(username)
}
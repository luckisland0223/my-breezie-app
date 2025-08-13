/**
 * Security utilities for data protection and validation
 */

// Simple encryption/decryption for local storage
const ENCRYPTION_KEY = 'breezie-secure-2024'

export function encryptData(data: string): string {
  try {
    // Simple encryption - in production, use proper encryption like crypto-js
    const encrypted = btoa(unescape(encodeURIComponent(data + ENCRYPTION_KEY)))
    return encrypted
  } catch (error) {
    console.warn('Encryption failed:', error)
    return data
  }
}

export function decryptData(encryptedData: string): string {
  try {
    const decrypted = decodeURIComponent(escape(atob(encryptedData)))
    return decrypted.replace(ENCRYPTION_KEY, '')
  } catch (error) {
    console.warn('Decryption failed:', error)
    return encryptedData
  }
}

// Secure storage wrapper
export const secureStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null
    
    const item = localStorage.getItem(name)
    if (!item) return null
    
    try {
      const parsed = JSON.parse(item)
      if (parsed.encrypted) {
        return JSON.stringify({
          ...parsed,
          state: JSON.parse(decryptData(parsed.state))
        })
      }
      return item
    } catch (error) {
      console.warn('Failed to decrypt storage item:', error)
      return item
    }
  },
  
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return
    
    try {
      const parsed = JSON.parse(value)
      const encrypted = {
        ...parsed,
        encrypted: true,
        timestamp: Date.now(),
        state: encryptData(JSON.stringify(parsed.state))
      }
      localStorage.setItem(name, JSON.stringify(encrypted))
    } catch (error) {
      console.warn('Failed to encrypt storage item:', error)
      localStorage.setItem(name, value)
    }
  },
  
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  }
}

// Input sanitization
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 2000) // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
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
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Generate secure random string
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i]! % chars.length]
    }
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  
  return result
}

// Rate limiting for client-side actions
class ClientRateLimit {
  private limits = new Map<string, { count: number; resetTime: number }>()
  
  check(key: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const limit = this.limits.get(key)
    
    if (!limit || now > limit.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (limit.count >= maxRequests) {
      return false
    }
    
    limit.count++
    return true
  }
  
  cleanup() {
    const now = Date.now()
    for (const [key, limit] of this.limits.entries()) {
      if (now > limit.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

export const clientRateLimit = new ClientRateLimit()

// Clean up rate limits every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => clientRateLimit.cleanup(), 5 * 60 * 1000)
}

// Content Security Policy violation handler
export function handleCSPViolation(event: SecurityPolicyViolationEvent) {
  console.warn('CSP Violation:', {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy
  })
  
  // In production, you might want to report this to your monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Report to monitoring service
    fetch('/api/security/csp-violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Silently fail - don't let security reporting break the app
    })
  }
}

// Initialize CSP violation reporting
if (typeof window !== 'undefined') {
  document.addEventListener('securitypolicyviolation', handleCSPViolation)
}
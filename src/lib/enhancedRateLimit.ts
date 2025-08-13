import { type NextRequest, NextResponse } from 'next/server'

// Enhanced rate limiting with user-based and endpoint-specific limits
interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// Different rate limits for different endpoints and user types
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Chat endpoint - most resource intensive
  '/api/chat': {
    windowMs: 1 * 60 * 1000,  // 1 minute
    maxRequests: 10,           // 10 requests per minute
  },
  
  // Authentication endpoints
  '/api/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,            // 5 attempts per 15 minutes
    skipSuccessfulRequests: true
  },
  
  '/api/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,            // 3 registration attempts per hour
  },
  
  // Emotion tracking
  '/api/emotions': {
    windowMs: 1 * 60 * 1000,  // 1 minute
    maxRequests: 20,           // 20 requests per minute
  },
  
  // Default for other endpoints
  'default': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,          // 100 requests per 15 minutes
  }
}

// Premium user rate limits (higher limits for paying users)
const PREMIUM_RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/chat': {
    windowMs: 1 * 60 * 1000,  // 1 minute
    maxRequests: 30,           // 3x higher limit for premium users
  },
  
  '/api/emotions': {
    windowMs: 1 * 60 * 1000,  // 1 minute
    maxRequests: 60,           // 3x higher limit
  },
  
  'default': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300,          // 3x higher limit
  }
}

// In-memory store (use Redis in production for horizontal scaling)
const ipRateLimitStore = new Map<string, RateLimitEntry>()
const userRateLimitStore = new Map<string, RateLimitEntry>()

// Get client identifier (IP + User ID if available)
function getClientIdentifier(request: NextRequest, userId?: string): { ip: string; userId?: string } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             request.headers.get('cf-connecting-ip') ||
             'unknown'
  
  return { ip, userId }
}

// Get rate limit configuration for endpoint and user type
function getRateLimitConfig(pathname: string, isPremium = false): RateLimitConfig {
  const configs = isPremium ? PREMIUM_RATE_LIMITS : RATE_LIMIT_CONFIGS
  return configs[pathname] || configs.default!
}

// Enhanced rate limiting middleware
export function enhancedRateLimit(
  request: NextRequest, 
  options: { 
    userId?: string
    isPremium?: boolean
    endpoint?: string 
  } = {}
): NextResponse | null {
  const { userId, isPremium = false, endpoint } = options
  const pathname = endpoint || new URL(request.url).pathname
  const { ip } = getClientIdentifier(request, userId)
  
  const config = getRateLimitConfig(pathname, isPremium)
  const now = Date.now()
  
  // Create composite key for rate limiting
  const rateLimitKey = userId ? `user:${userId}:${pathname}` : `ip:${ip}:${pathname}`
  const store = userId ? userRateLimitStore : ipRateLimitStore
  
  // Get or create rate limit entry
  let rateLimitEntry = store.get(rateLimitKey) || { 
    count: 0, 
    resetTime: now + config.windowMs,
    lastRequest: now
  }
  
  // Reset if window has passed
  if (now > rateLimitEntry.resetTime) {
    rateLimitEntry = {
      count: 0,
      resetTime: now + config.windowMs,
      lastRequest: now
    }
  }
  
  // Increment request count
  rateLimitEntry.count++
  rateLimitEntry.lastRequest = now
  store.set(rateLimitKey, rateLimitEntry)
  
  // Check if rate limit exceeded
  if (rateLimitEntry.count > config.maxRequests) {
    const retryAfter = Math.ceil((rateLimitEntry.resetTime - now) / 1000)
    
    // Log rate limit violation for monitoring
    console.warn(`Rate limit exceeded for ${rateLimitKey}`, {
      count: rateLimitEntry.count,
      limit: config.maxRequests,
      ip,
      userId,
      endpoint: pathname,
      userAgent: request.headers.get('user-agent')
    })
    
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: isPremium 
          ? 'You have exceeded the premium rate limit. Please try again later.'
          : 'You have exceeded the rate limit. Consider upgrading to premium for higher limits.',
        retryAfter,
        upgradeAvailable: !isPremium
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitEntry.resetTime.toString(),
          'X-RateLimit-Policy': `${config.maxRequests} requests per ${config.windowMs / 1000} seconds`
        }
      }
    )
  }
  
  // Add rate limit headers to successful requests
  const remaining = config.maxRequests - rateLimitEntry.count
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitEntry.resetTime.toString())
  
  return null // Allow request to proceed
}

// Burst protection - prevent rapid-fire requests
export function burstProtection(request: NextRequest, userId?: string): NextResponse | null {
  const { ip } = getClientIdentifier(request, userId)
  const key = userId ? `burst:user:${userId}` : `burst:ip:${ip}`
  const now = Date.now()
  
  const entry = userRateLimitStore.get(key)
  
  // Allow first request or if enough time has passed
  if (!entry || now - entry.lastRequest > 1000) { // 1 second minimum between requests
    userRateLimitStore.set(key, { count: 1, resetTime: now + 60000, lastRequest: now })
    return null
  }
  
  // Check for burst pattern (more than 5 requests in 10 seconds)
  if (entry.count > 5 && now - entry.resetTime < 10000) {
    return NextResponse.json(
      { 
        error: 'Burst limit exceeded',
        message: 'Please slow down your requests. Wait a moment before trying again.',
        retryAfter: 10
      },
      { 
        status: 429,
        headers: { 'Retry-After': '10' }
      }
    )
  }
  
  // Update entry
  entry.count++
  entry.lastRequest = now
  userRateLimitStore.set(key, entry)
  
  return null
}

// Progressive rate limiting - stricter limits for suspicious behavior
export function progressiveRateLimit(request: NextRequest, userId?: string): NextResponse | null {
  const { ip } = getClientIdentifier(request, userId)
  const key = `progressive:${userId || ip}`
  const now = Date.now()
  
  const entry = userRateLimitStore.get(key)
  
  if (!entry) {
    userRateLimitStore.set(key, { count: 1, resetTime: now + 3600000, lastRequest: now }) // 1 hour window
    return null
  }
  
  // Progressive thresholds
  const hourlyLimit = entry.count > 1000 ? 50 :   // Very high usage: strict limit
                      entry.count > 500 ? 100 :    // High usage: moderate limit
                      entry.count > 100 ? 200 :    // Normal usage: standard limit
                      500                           // Low usage: generous limit
  
  if (entry.count > hourlyLimit) {
    return NextResponse.json(
      { 
        error: 'Progressive rate limit exceeded',
        message: 'Your request pattern suggests unusual activity. Please contact support if you believe this is an error.',
        retryAfter: 3600 // 1 hour
      },
      { status: 429 }
    )
  }
  
  entry.count++
  entry.lastRequest = now
  userRateLimitStore.set(key, entry)
  
  return null
}

// Clean up old rate limit entries
export function cleanupRateLimitStores(): void {
  const now = Date.now()
  
  // Clean IP-based store
  for (const [key, entry] of ipRateLimitStore.entries()) {
    if (now > entry.resetTime + 3600000) { // Keep for 1 hour after reset
      ipRateLimitStore.delete(key)
    }
  }
  
  // Clean user-based store
  for (const [key, entry] of userRateLimitStore.entries()) {
    if (now > entry.resetTime + 3600000) {
      userRateLimitStore.delete(key)
    }
  }
  
  console.log(`Rate limit cleanup: IP store size: ${ipRateLimitStore.size}, User store size: ${userRateLimitStore.size}`)
}

// Run cleanup every 10 minutes
setInterval(cleanupRateLimitStores, 10 * 60 * 1000)

// Get rate limit status for monitoring
export function getRateLimitStatus(userId?: string): {
  ipStoreSize: number
  userStoreSize: number
  userLimits?: RateLimitEntry[]
} {
  const status = {
    ipStoreSize: ipRateLimitStore.size,
    userStoreSize: userRateLimitStore.size,
    userLimits: undefined as RateLimitEntry[] | undefined
  }
  
  if (userId) {
    const userLimits: RateLimitEntry[] = []
    for (const [key, entry] of userRateLimitStore.entries()) {
      if (key.includes(`user:${userId}`)) {
        userLimits.push(entry)
      }
    }
    status.userLimits = userLimits
  }
  
  return status
}

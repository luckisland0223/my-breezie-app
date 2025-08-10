# 🔒 Breezie Production Security Guide

## 🚀 Security Features Implemented

### ✅ 1. Production-Grade JWT Management
- **Dual Token System**: Separate access (15min) and refresh (7d) tokens
- **Token Rotation**: Automatic refresh mechanism
- **Token Revocation**: Blacklist system for logout/security
- **Enhanced Validation**: Issuer, audience, and type validation
- **Secure Cookies**: HTTP-only refresh token storage

### ✅ 2. Enhanced API Rate Limiting
- **Endpoint-Specific Limits**: Different limits per API endpoint
- **User-Based Limits**: Premium users get higher limits
- **Burst Protection**: Prevents rapid-fire requests
- **Progressive Limiting**: Stricter limits for suspicious behavior
- **Monitoring**: Rate limit status tracking

### ✅ 3. Client-Side Data Encryption
- **AES-256 Encryption**: Strong encryption for localStorage
- **PBKDF2 Key Derivation**: Secure key generation from user secrets
- **Data Integrity**: Checksum validation for stored data
- **Secure Migration**: Automatic migration of existing data
- **Export/Import**: Encrypted backup functionality

## 🔧 Implementation Details

### JWT Security Features

```typescript
// Token pair generation with enhanced security
const tokens = generateTokenPair({
  userId: user.id,
  email: user.email,
  username: user.username,
  subscriptionTier: user.subscriptionTier
})

// Automatic token refresh
const refreshed = await refreshUserToken(refreshToken)

// Secure token revocation
revokeUserTokens(accessToken, refreshToken)
```

### Rate Limiting Configuration

```typescript
// Chat API: 10 requests/minute (30 for premium)
// Login API: 5 attempts/15 minutes
// Registration: 3 attempts/hour
// Emotions API: 20 requests/minute (60 for premium)

// Enhanced rate limiting with user context
enhancedRateLimit(request, {
  userId: user?.userId,
  isPremium: user?.subscriptionTier === 'pro',
  endpoint: '/api/chat'
})
```

### Data Encryption Usage

```typescript
// Create secure storage for user
const secureStorage = createSecureStorage(userId, sessionToken)

// Store encrypted data
secureStorage.setItem('emotionData', emotionRecords)

// Retrieve and decrypt
const data = secureStorage.getItem('emotionData')

// Automatic migration from unencrypted storage
migrateToEncryptedStorage(userId, sessionToken)
```

## 🛠️ Production Deployment Steps

### 1. Generate Secure Secrets

```bash
# Generate production secrets
npm run security:generate

# Copy the generated secrets to your environment
```

**Generated Secrets (Example - Generate your own):**
```env
JWT_SECRET="37f4805b0f87f35e65847308025720db954d45273d90f1b5649ff4ea3bfb12e6d9d2e30fec36fa2b4d338e74a904580c5f8914630cab811d80413549a8cb24e6"

JWT_REFRESH_SECRET="52cf2c14c966b0fac7641b352be13da2b89174831360a8fe806d8c3eadb5af13a6f6a58c7d6d735b3cf67cc33498ddf321bc7320c68de3d06a4d88055a0d818a"

NEXTAUTH_SECRET="c5ac16569e7f63557dd4ecc8536eecdb0d91291f75aae912eadd9d97fb96d3a5"
```

### 2. Configure Environment Variables

**Required for Production:**
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:5432/postgres"

# JWT Security
JWT_SECRET="[64-character-hex-string]"
JWT_REFRESH_SECRET="[64-character-hex-string]"

# AI Service
GEMINI_API_KEY="[your-gemini-api-key]"

# Admin Access
ADMIN_EMAIL="[your-admin-email]"
```

**Optional for Enhanced Features:**
```env
# Payment Processing
STRIPE_SECRET_KEY="sk_live_[your-stripe-key]"
STRIPE_WEBHOOK_SECRET="whsec_[your-webhook-secret]"

# Monitoring
SENTRY_DSN="[your-sentry-dsn]"
REDIS_URL="[your-redis-url]"
```

### 3. Vercel Deployment Configuration

1. **Add Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables above
   - Ensure `NODE_ENV=production` is set

2. **Deploy Configuration**:
   ```json
   // vercel.json (optional)
   {
     "functions": {
       "src/app/api/**": {
         "maxDuration": 30
       }
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "Strict-Transport-Security",
             "value": "max-age=31536000; includeSubDomains"
           }
         ]
       }
     ]
   }
   ```

### 4. Database Setup (Supabase)

1. **Create Supabase Project**:
   - Visit [supabase.com](https://supabase.com)
   - Create project: `breezie-production`
   - Set strong database password

2. **Run Database Migration**:
   ```bash
   # Push schema to production database
   npx prisma db push
   
   # Or create migration for version control
   npx prisma migrate deploy
   ```

3. **Verify Connection**:
   ```bash
   # Test production database
   curl https://your-app.vercel.app/api/db-test
   ```

## 🔍 Security Validation

### Run Security Check

```bash
# Local security validation
npm run security:check

# Production security check (after deployment)
curl https://your-app.vercel.app/api/security/check \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Security Checklist

- [ ] **Environment Variables**: All required vars configured
- [ ] **JWT Secrets**: Strong, unique secrets (64+ chars)
- [ ] **Database Security**: SSL enabled, strong password
- [ ] **Rate Limiting**: Active and properly configured
- [ ] **Data Encryption**: Client-side encryption working
- [ ] **HTTPS**: Enforced in production
- [ ] **Security Headers**: CSP, HSTS, etc. configured
- [ ] **Admin Access**: Admin email configured
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Monitoring**: Error tracking and analytics

## 🛡️ Security Monitoring

### Key Metrics to Monitor

1. **Authentication Events**:
   - Failed login attempts
   - Token refresh failures
   - Account lockouts

2. **Rate Limiting**:
   - Rate limit violations
   - Unusual traffic patterns
   - Premium vs free user usage

3. **Data Security**:
   - Encryption failures
   - Data integrity violations
   - Unauthorized access attempts

### Alerts to Set Up

- High rate of failed logins
- Unusual API usage patterns
- Database connection failures
- JWT verification failures

## 🚨 Incident Response

### If Security Breach Suspected

1. **Immediate Actions**:
   - Rotate JWT secrets
   - Force logout all users
   - Review access logs
   - Check for data compromise

2. **Investigation**:
   - Analyze rate limiting logs
   - Check authentication patterns
   - Review database access logs
   - Validate data integrity

3. **Recovery**:
   - Update security measures
   - Notify affected users
   - Implement additional monitoring
   - Document lessons learned

## 📊 Security Score Interpretation

- **95-100%**: Excellent - Production ready
- **80-94%**: Good - Minor improvements needed
- **60-79%**: Warning - Address issues before production
- **Below 60%**: Critical - Major security gaps

## 🔄 Regular Maintenance

### Weekly Tasks
- Review rate limiting metrics
- Check for failed authentication attempts
- Validate environment variable security

### Monthly Tasks
- Rotate JWT secrets (recommended)
- Review and update security policies
- Audit user access patterns
- Update dependencies for security patches

### Quarterly Tasks
- Full security audit
- Penetration testing
- Review and update security documentation
- Evaluate new security technologies

## 📞 Support

For security questions or incidents:
- Review security check endpoint: `/api/security/check`
- Check rate limiting status in admin dashboard
- Monitor application logs for security events
- Contact security team for critical issues

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular monitoring and updates are essential for maintaining a secure production environment.

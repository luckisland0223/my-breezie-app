'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SecurityStatus } from '@/components/SecurityStatus'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'
import { 
  Shield, 
  Key, 
  Lock, 
  Server, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SecurityPage() {
  const router = useRouter()
  const { user, token, isPremiumUser } = useAuthStore()
  const [generatedSecrets, setGeneratedSecrets] = useState<string>('')
  
  const generateSecrets = () => {
    // This would call the security:generate script output
    const secrets = `# Production Environment Variables
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:5432/postgres"
JWT_SECRET="${crypto.randomUUID()}${crypto.randomUUID()}".replace(/-/g, '')
JWT_REFRESH_SECRET="${crypto.randomUUID()}${crypto.randomUUID()}".replace(/-/g, '')
GEMINI_API_KEY="your-gemini-api-key"
ADMIN_EMAIL="admin@yourdomain.com"

# Optional for Enhanced Features
STRIPE_SECRET_KEY="sk_live_your-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
SENTRY_DSN="your-sentry-dsn"
REDIS_URL="your-redis-url"`
    
    setGeneratedSecrets(secrets)
    toast.success('Secure environment variables generated!')
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }
  
  return (
    <div className="min-h-screen gradient-surface">
      {/* Premium Header */}
      <header className="glass sticky top-0 z-50 border-b-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <CloudLogo size={24} />
              </div>
              <div>
                <CloudLogoText size="md" />
                <p className="text-xs text-gray-500">Feeling first, healing follows</p>
              </div>
            </Link>
            
            <Button variant="ghost" onClick={() => router.push('/')} className="glass-subtle hover:shadow-md transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Security Dashboard Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-glow">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h2>
          <p className="text-lg text-gray-600">
            Monitor and manage Breezie's security features and production readiness
          </p>
        </div>

        <Tabs defaultValue="status" className="space-y-8">
          <TabsList className="glass grid w-full grid-cols-4">
            <TabsTrigger value="status" className="glass-subtle">Security Status</TabsTrigger>
            <TabsTrigger value="features" className="glass-subtle">Security Features</TabsTrigger>
            <TabsTrigger value="deployment" className="glass-subtle">Deployment Guide</TabsTrigger>
            <TabsTrigger value="monitoring" className="glass-subtle">Monitoring</TabsTrigger>
          </TabsList>

          {/* Security Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <SecurityStatus />
          </TabsContent>

          {/* Security Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* JWT Management */}
              <Card className="glass shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-blue-600" />
                    JWT Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Dual Token System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Automatic Refresh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Token Revocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Enhanced Validation</span>
                  </div>
                </CardContent>
              </Card>

              {/* Rate Limiting */}
              <Card className="glass shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-purple-600" />
                    Rate Limiting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Endpoint-Specific Limits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">User-Based Limits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Burst Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-800">
                      {isPremiumUser() ? '3x Higher Limits' : 'Standard Limits'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Data Encryption */}
              <Card className="glass shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-cyan-600" />
                    Data Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">AES-256 Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">PBKDF2 Key Derivation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Data Integrity Check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Secure Migration</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployment Guide Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <Card className="glass shadow-xl border-0">
              <CardHeader>
                <CardTitle>Production Deployment Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Setup
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Generate secure JWT secrets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Configure environment variables</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Set up Supabase database</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Enable HTTPS enforcement</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      Vercel Configuration
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span>Add environment variables</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span>Configure security headers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span>Test database connection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span>Verify API endpoints</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="glass-subtle rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Generate Production Secrets</h4>
                    <Button onClick={generateSecrets} variant="outline" size="sm">
                      <Key className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                  
                  {generatedSecrets && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                        <pre>{generatedSecrets}</pre>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => copyToClipboard(generatedSecrets)}
                          variant="outline" 
                          size="sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button 
                          onClick={() => {
                            const blob = new Blob([generatedSecrets], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'breezie-production-env.txt'
                            a.click()
                            URL.revokeObjectURL(url)
                            toast.success('Environment file downloaded!')
                          }}
                          variant="outline" 
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Security Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Authentication Status</span>
                    <Badge className={user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {user ? 'Authenticated' : 'Not Authenticated'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subscription Tier</span>
                    <Badge className={isPremiumUser() ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                      {user?.subscriptionTier || 'Free'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Token Status</span>
                    <Badge className={token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {token ? 'Valid' : 'No Token'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rate Limit Tier</span>
                    <Badge className={isPremiumUser() ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                      {isPremiumUser() ? 'Premium Limits' : 'Standard Limits'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Lock className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Data Encryption</p>
                        <p className="text-xs text-gray-600">AES-256 client-side encryption</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Key className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">JWT Security</p>
                        <p className="text-xs text-gray-600">Production-grade token management</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Server className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Rate Limiting</p>
                        <p className="text-xs text-gray-600">Enhanced API protection</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Security Headers</p>
                        <p className="text-xs text-gray-600">CSP, HSTS, XSS protection</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

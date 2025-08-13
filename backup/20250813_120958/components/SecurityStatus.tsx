'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { AlertTriangle, CheckCircle, RefreshCw, Shield, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SecurityReport {
  timestamp: string
  environment: string
  overallStatus: 'excellent' | 'good' | 'warning' | 'critical'
  securityScore: number
  environmentVariables: {
    status: 'pass' | 'fail'
    errors: string[]
    warnings: string[]
    recommendations: string[]
  }
  jwtConfiguration: {
    status: 'pass' | 'fail'
    recommendations: string[]
  }
  encryptionSetup: {
    status: 'pass' | 'fail'
    issues: string[]
  }
  rateLimiting: {
    status: string
    ipStoreSize: number
    userStoreSize: number
    isHealthy: boolean
  }
  immediateActions: string[]
  productionReadiness: {
    databaseConfigured: boolean
    jwtSecretsSecure: boolean
    encryptionWorking: boolean
    rateLimitingActive: boolean
    httpsEnforced: boolean
    adminEmailSet: boolean
  }
}

export function SecurityStatus() {
  const [report, setReport] = useState<SecurityReport | null>(null)
  const [loading, setLoading] = useState(false)
  const { token, user } = useAuthStore()
  
  const fetchSecurityReport = async () => {
    if (!token) {
      toast.error('Authentication required to view security status')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/security/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch security report')
      }
      
      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error('Security check failed:', error)
      toast.error('Failed to load security report')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (user && token) {
      fetchSecurityReport()
    }
  }, [user, token])
  
  if (!user || !token) {
    return (
      <Card className="glass border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Please log in to view security status</p>
        </CardContent>
      </Card>
    )
  }
  
  if (loading) {
    return (
      <Card className="glass border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading security report...</p>
        </CardContent>
      </Card>
    )
  }
  
  if (!report) {
    return (
      <Card className="glass border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-4 text-gray-600">Failed to load security report</p>
          <Button onClick={fetchSecurityReport} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good': return <CheckCircle className="h-5 w-5" />
      case 'warning': return <AlertTriangle className="h-5 w-5" />
      case 'critical': return <XCircle className="h-5 w-5" />
      default: return <Shield className="h-5 w-5" />
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Overall Security Status */}
      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Overall Security Score</h3>
              <p className="text-gray-600 text-sm">Last checked: {new Date(report.timestamp).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-3xl text-gray-900">{report.securityScore}%</div>
              <Badge className={getStatusColor(report.overallStatus)}>
                {getStatusIcon(report.overallStatus)}
                <span className="ml-1 capitalize">{report.overallStatus}</span>
              </Badge>
            </div>
          </div>
          
          <Button 
            onClick={fetchSecurityReport}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Report
          </Button>
        </CardContent>
      </Card>
      
      {/* Production Readiness Checklist */}
      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Production Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(report.productionReadiness).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {value ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                {value ? 'Ready' : 'Needs Setup'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Security Components Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Environment Variables */}
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base">Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={report.environmentVariables.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {report.environmentVariables.status === 'pass' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {report.environmentVariables.status}
            </Badge>
            {report.environmentVariables.errors.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 font-medium text-red-600 text-xs">Errors:</p>
                <ul className="space-y-1 text-red-600 text-xs">
                  {report.environmentVariables.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* JWT Configuration */}
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base">JWT Security</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={report.jwtConfiguration.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {report.jwtConfiguration.status === 'pass' ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
              {report.jwtConfiguration.status}
            </Badge>
            {report.jwtConfiguration.recommendations.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 font-medium text-xs text-yellow-600">Recommendations:</p>
                <ul className="space-y-1 text-xs text-yellow-600">
                  {report.jwtConfiguration.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Encryption Setup */}
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base">Data Encryption</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={report.encryptionSetup.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {report.encryptionSetup.status === 'pass' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {report.encryptionSetup.status}
            </Badge>
            {report.encryptionSetup.issues.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 font-medium text-red-600 text-xs">Issues:</p>
                <ul className="space-y-1 text-red-600 text-xs">
                  {report.encryptionSetup.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Rate Limiting */}
        <Card className="glass border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base">Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={report.rateLimiting.isHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {report.rateLimiting.isHealthy ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
              {report.rateLimiting.status}
            </Badge>
            <div className="mt-2 text-gray-600 text-xs">
              <p>IP Store: {report.rateLimiting.ipStoreSize} entries</p>
              <p>User Store: {report.rateLimiting.userStoreSize} entries</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Immediate Actions */}
      {report.immediateActions.length > 0 && (
        <Card className="glass border-0 border-l-4 border-l-red-500 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Immediate Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.immediateActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-red-700 text-sm">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
